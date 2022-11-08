import { getLogger } from "loglevel";
import "./log.utils";
const dotenv = require("dotenv").config();
import axios, { AxiosResponse } from "axios";
import EnergyUsageModel from "../models/energy.usage.model";
import dateUtils, { DateUtils } from "./date.utils";
import {
  ChartData,
  DaySummary,
  EnergyUsage,
  StandingChargeInfo,
} from "../types/energy.types";
import { ChartInput, TableNames } from "../types/common.types";
import EnergyBillModel from "../models/energy.bill.model";
import GeneralUtils from "./general.utils";

const log = getLogger("energy.utils");

class EnergyUtils {
  static baseURL = "https://api.octopus.energy";
  static defaultPageSize = 500;
  static maximumPageSize = 20000;
  static isLoading = false;

  static getAppropriatePageSize = (daysToFetch: number): number => {
    const requiredEntries = 24 * 2 * daysToFetch;

    if (requiredEntries < this.defaultPageSize) return this.defaultPageSize;
    else if (requiredEntries > this.maximumPageSize) return this.maximumPageSize;
    else return requiredEntries + 10;
  };

  static updateReadings = async () => {
    if (this.isLoading) {
      log.info("Already loading data from another request");
      return;
    }

    this.isLoading = true;
    const today = new Date();

    const latestDatePromises: Array<Promise<Date>> = [
      EnergyUsageModel.selectLatestDate(TableNames.gas_usage),
      EnergyUsageModel.selectLatestDate(TableNames.electricity_usage),
    ];
    const [latestGasDate, latestElectricityDate] = await Promise.all<Date>(
      latestDatePromises,
    );

    const readingPromises = [];

    if (latestGasDate.toLocaleDateString() !== today.toLocaleDateString())
      readingPromises.push(this.updateGasReadings(latestGasDate, today));

    if (latestElectricityDate.toLocaleDateString() !== today.toLocaleDateString())
      readingPromises.push(this.updateElectricityReadings(latestElectricityDate, today));

    if (readingPromises.length === 0) return;

    Promise.all(readingPromises).then(() => {
      this.isLoading = false;
      log.info("Updated energy entries");
    });
  };

  static updateGasReadings = async (startDate: Date, endDate: Date) => {
    const days = dateUtils.daysBetweenTwoDates(startDate, endDate);
    const pageSize = this.getAppropriatePageSize(days);

    log.info(
      `Gas: Getting data between ${dateUtils.toLocaleISOString(
        startDate,
      )} and ${dateUtils.toLocaleISOString(endDate)}`,
    );

    let requestURL = `${this.baseURL}/v1/gas-meter-points/${process.env.OCTOPUS_GAS_MPRN}/meters/${process.env.OCTOPUS_GAS_SERIAL}/consumption?page_size=${pageSize}&order_by=period`;
    requestURL += `&period_from=${dateUtils.toLocaleISOString(startDate)}`;
    requestURL += `&period_to=${dateUtils.toLocaleISOString(endDate)}`;

    const data = await this.genericEnergyRequest(requestURL);
    log.debug(`Gas: Fetched ${data.length} entries`);

    const promises = [];
    const entries = [];
    data.forEach((entry, i) => {
      entries.push([
        entry.interval_start,
        entry.interval_end,
        (entry.consumption * 1.02264 * 40.1) / 3.6,
        new Date(),
      ]);

      if ((i % 100 === 0 || i === data.length - 1) && i > 0) {
        log.debug(`Gas: ${entries.length} entries, making it ${i}/${data.length}`);
        promises.push(EnergyUsageModel.insertEntry(TableNames.gas_usage, entries));
        entries.length = 0;
      }
    });

    await Promise.all(promises).then(() => {
      log.info(`Gas: ${promises.length} queries executed for ${data.length} data points`);
    });
  };

  static updateElectricityReadings = async (startDate: Date, endDate: Date) => {
    const days = dateUtils.daysBetweenTwoDates(startDate, endDate);
    const pageSize = this.getAppropriatePageSize(days);

    log.info(
      `Electric: Getting data between ${dateUtils.toLocaleISOString(
        startDate,
      )} and ${dateUtils.toLocaleISOString(endDate)}`,
    );

    let requestURL = `${this.baseURL}/v1/electricity-meter-points/${process.env.OCTOPUS_ELECTRIC_MPAN}/meters/${process.env.OCTOPUS_ELECTRIC_SERIAL}/consumption?page_size=${pageSize}&order_by=period`;
    requestURL += `&period_from=${dateUtils.toLocaleISOString(startDate)}`;
    requestURL += `&period_to=${dateUtils.toLocaleISOString(endDate)}`;

    const data = await this.genericEnergyRequest(requestURL);
    log.debug(`Electric: Fetched ${data.length} entries`);

    const promises = [];
    const entries = [];
    data.forEach((entry, i) => {
      entries.push([
        entry.interval_start,
        entry.interval_end,
        entry.consumption,
        new Date(),
      ]);

      if ((i % 100 === 0 || i === data.length - 1) && i > 0) {
        log.debug(`Electric: ${entries.length} entries, making it ${i}/${data.length}`);
        promises.push(
          EnergyUsageModel.insertEntry(TableNames.electricity_usage, entries),
        );
        entries.length = 0;
      }
    });

    await Promise.all(promises).then(() => {
      log.info(
        `Electric: ${promises.length} queries executed for ${data.length} data points`,
      );
    });
  };

  static genericEnergyRequest = async (requestURL: string): Promise<EnergyUsage[]> => {
    log.debug(`Running request: ${requestURL}`);

    let response: AxiosResponse<any, any>;

    try {
      response = await axios.get(requestURL, {
        auth: {
          username: process.env.OCTOPUS_API_KEY,
          password: this.baseURL,
        },
      });
    } catch (err) {
      log.error(`Request failed with issue ${err}`);
      return [];
    }

    if (response.status === 400)
      log.error(`Request failed with error 400 for ${requestURL}`);

    if (response.status !== 200)
      log.error(
        `Request failed with error ${response.status} ${response.statusText} for ${requestURL}`,
      );

    return response.data.results;
  };

  static latestDailySummary = async (): Promise<DaySummary> => {
    const [electricEndDate, gasEndDate] = await Promise.all([
      EnergyUsageModel.selectLatestCompletedDate(TableNames.electricity_usage),
      EnergyUsageModel.selectLatestCompletedDate(TableNames.gas_usage),
    ]);

    const electricStartDate = dateUtils.addTime(electricEndDate, 0, 0, -1);
    const gasStartDate = dateUtils.addTime(gasEndDate, 0, 0, -1);

    const [electricityEntries, gasEntries] = await Promise.all([
      EnergyUsageModel.selectEntries(
        TableNames.electricity_usage,
        electricStartDate,
        electricEndDate,
      ),
      EnergyUsageModel.selectEntries(TableNames.gas_usage, gasStartDate, gasEndDate),
    ]);

    const electricityUsage = electricityEntries.reduce(
      (partialSum, a) => partialSum + a.consumption,
      0,
    );
    const gasUsage = gasEntries.reduce((partialSum, a) => partialSum + a.consumption, 0);

    const [electricRate, gasRate] = await Promise.all([
      EnergyBillModel.selectLatesetRateAndCharge(TableNames.electricity_bill),
      EnergyBillModel.selectLatesetRateAndCharge(TableNames.gas_bill),
    ]);

    return {
      electric: {
        date: electricStartDate,
        usage: electricityUsage.toFixed(3) + "kWh",
        price: "£" + ((electricityUsage * electricRate.rate_kwh) / 100).toFixed(2),
      },
      gas: {
        date: gasStartDate,
        usage: gasUsage.toFixed(3) + "kWh",
        price: "£" + ((gasUsage * gasRate.rate_kwh) / 100).toFixed(2),
      },
    };
  };

  static chartDataDateRange = async (
    startDate: Date,
    endDate: Date,
    mode: "gas" | "electric",
  ): Promise<ChartData> => {
    const usageTableName =
      mode === "electric" ? TableNames.electricity_usage : TableNames.gas_usage;
    const billTableName =
      mode === "electric" ? TableNames.electricity_bill : TableNames.gas_bill;

    const usageEntries = await EnergyUsageModel.selectEntries(
      usageTableName,
      startDate,
      endDate,
    );

    const standingChargeInfo = await EnergyBillModel.selectLatesetRateAndCharge(
      billTableName,
    );

    const dataPoints: Array<number> = [];
    const labels: Array<string> = [];

    let currentDateString = "";
    let dailyUsage = 0.0;

    usageEntries.forEach((entry: EnergyUsage, i) => {
      const day = DateUtils.weekdays.short[entry.interval_start.getUTCDay()];
      const date = GeneralUtils.padWithLeadingCharacters(
        entry.interval_start.getUTCDate(),
        2,
        "0",
      );
      const month = GeneralUtils.padWithLeadingCharacters(
        entry.interval_start.getUTCMonth() + 1,
        2,
        "0",
      );
      const entryDate = `${day} ${date}/${month}`;

      if (i === 0) {
        currentDateString = entryDate;
        dailyUsage = entry.consumption;
      }

      if (entryDate === currentDateString) {
        // Just keep adding the usage of that day
        dailyUsage += entry.consumption;
      } else {
        // Entry for that day is complete
        dataPoints.push(parseFloat(dailyUsage.toFixed(5)));
        labels.push(currentDateString);

        dailyUsage = entry.consumption;
        currentDateString = entryDate;
      }

      if (i === usageEntries.length - 1) {
        // Reached the end
        dataPoints.push(parseFloat(dailyUsage.toFixed(5)));
        labels.push(currentDateString);

        dailyUsage = entry.consumption;
        currentDateString = entryDate;
      }
    });

    const chart = this.generateChart(
      startDate.toLocaleDateString("en-GB") + "-" + endDate.toLocaleDateString("en-GB"),
      dataPoints,
      labels,
      mode === "electric" ? 5 : 90,
      "kWh",
    );

    const totalUsage = dataPoints.reduce((rolling, val) => rolling + val, 0);
    const charge = totalUsage * standingChargeInfo.rate_kwh;

    return {
      data: dataPoints,
      labels: labels,
      chart: chart,
      energyUsed: `${totalUsage.toFixed(2)} kWh`,
      charged: "£" + (charge / 100).toFixed(2),
      rate: `@${standingChargeInfo.rate_kwh}p/kWh`,
    };
  };

  static chartDataSpecificDate = async (
    startDate: Date,
    endDate: Date,
    mode: "gas" | "electric",
  ): Promise<ChartData> => {
    let usageTable =
      mode === "electric" ? TableNames.electricity_usage : TableNames.gas_usage;
    let billTable =
      mode === "electric" ? TableNames.electricity_bill : TableNames.gas_bill;

    const entries: Array<EnergyUsage> = await EnergyUsageModel.selectEntries(
      usageTable,
      startDate,
      endDate,
    );

    const standingChargeInfo = await EnergyBillModel.selectLatesetRateAndCharge(
      billTable,
    );

    const dataPoints: Array<number> = [];
    const labels: Array<string> = [];
    let energyUsed = 0.0;

    if (entries === undefined || entries.length === 0) {
      log.info(
        `Trying to generate a chart for ${startDate.toUTCString()} but no entries exist`,
      );
    } else {
      entries.forEach((entry, i) => {
        if (i === 0) {
          dataPoints.push(parseFloat(entry.consumption.toFixed(5)));
          energyUsed = entry.consumption;
        } else {
          dataPoints.push(
            parseFloat(
              (dataPoints[dataPoints.length - 1] + entry.consumption).toFixed(5),
            ),
          );
          energyUsed += entry.consumption;
        }

        const start_range_time = entry.interval_start
          .toUTCString()
          .split(" ")[4]
          .split(":");
        const end_range_time = entry.interval_end.toUTCString().split(" ")[4].split(":");

        labels.push(
          `${start_range_time[0]}:${start_range_time[1]}-${end_range_time[0]}:${end_range_time[1]}`,
        );
      });
    }

    const chart = this.generateChart(
      startDate.toLocaleDateString("en-GB"),
      dataPoints,
      labels,
      mode === "electric" ? 5 : 90,
      "kWh",
    );
    let charge = (energyUsed * standingChargeInfo.rate_kwh) / 100;

    return {
      data: dataPoints,
      labels: labels,
      chart: chart,
      energyUsed: `${energyUsed.toFixed(2)} kWh`,
      charged: "£" + charge.toFixed(2),
      rate: `@${standingChargeInfo.rate_kwh}p/kWh`,
    };
  };

  static generateChart = (
    title: string,
    data: Array<number>,
    labels: Array<string>,
    max: number,
    yName: string,
  ): ChartInput => {
    return {
      data: {
        labels: labels,
        datasets: [
          {
            pointRadius: 4,
            pointBackgroundColor: "rgb(0,0,255)",
            data: data,
          },
        ],
      },
      options: {
        legend: { display: false },
        scales: {
          yAxes: [
            {
              display: true,
              ticks: {
                max: max,
                min: 0,
              },
              scaleLabel: {
                display: true,
                labelString: yName,
              },
            },
          ],
        },
        title: {
          display: true,
          text: title,
        },
      },
    };
  };
}

export default EnergyUtils;
