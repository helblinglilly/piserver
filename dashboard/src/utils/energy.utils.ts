import { getLogger } from "loglevel";
import "./log.utils";
const dotenv = require("dotenv").config();
import axios, { AxiosResponse } from "axios";
import EnergyModel from "../models/energy.model";
import dateUtils from "./date.utils";
import { DaySummary, EnergyData } from "../types/energy.types";

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
    if (this.isLoading) return;

    this.isLoading = true;
    const today = new Date();

    const latestDatePromises: Array<Promise<Date>> = [
      EnergyModel.selectLatestGasEntryInsert(),
      EnergyModel.selectLatestElectricityEntryInsert(),
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

    await Promise.all(readingPromises).then(() => {
      this.isLoading = false;
      log.info("Updated energy entries");
    });
  };

  static updateGasReadings = async (startDate: Date, endDate: Date) => {
    const days = dateUtils.daysBetweenTwoDates(startDate, endDate);
    const pageSize = this.getAppropriatePageSize(days);

    log.info(
      `Updating gas entries between ${dateUtils.toLocaleISOString(
        startDate,
      )} and ${dateUtils.toLocaleISOString(endDate)}`,
    );

    let requestURL = `${this.baseURL}/v1/gas-meter-points/${process.env.OCTOPUS_GAS_MPRN}/meters/${process.env.OCTOPUS_GAS_SERIAL}/consumption?page_size=${pageSize}&order_by=period`;
    requestURL += `&period_from=${dateUtils.toLocaleISOString(startDate)}`;
    requestURL += `&period_to=${dateUtils.toLocaleISOString(endDate)}`;

    const data = await this.genericEnergyRequest(requestURL);
    log.debug(`Retrieved ${data.length} gas entries`);

    const promises = [];
    data.forEach((entry) =>
      promises.push(
        EnergyModel.insertGasEntry(
          entry.interval_start,
          entry.interval_end,
          entry.consumption,
        ),
      ),
    );

    await Promise.all(promises).then(() => {
      log.debug(`Inserted ${promises.length} gas entries`);
    });
  };

  static updateElectricityReadings = async (startDate: Date, endDate: Date) => {
    const days = dateUtils.daysBetweenTwoDates(startDate, endDate);
    const pageSize = this.getAppropriatePageSize(days);

    log.info(
      `Updating electricity entries between ${dateUtils.toLocaleISOString(
        startDate,
      )} and ${dateUtils.toLocaleISOString(endDate)}`,
    );

    let requestURL = `${this.baseURL}/v1/electricity-meter-points/${process.env.OCTOPUS_ELECTRIC_MPAN}/meters/${process.env.OCTOPUS_ELECTRIC_SERIAL}/consumption?page_size=${pageSize}&order_by=period`;
    requestURL += `&period_from=${dateUtils.toLocaleISOString(startDate)}`;
    requestURL += `&period_to=${dateUtils.toLocaleISOString(endDate)}`;

    const data = await this.genericEnergyRequest(requestURL);
    log.debug(`Retrieved ${data.length} electricity entries`);

    const promises = [];
    data.forEach((entry) =>
      promises.push(
        EnergyModel.insertElectricityEntry(
          entry.interval_start,
          entry.interval_end,
          entry.consumption,
        ),
      ),
    );

    await Promise.all(promises).then(() => {
      log.debug(`Inserted ${promises.length} electricity entries`);
    });
  };

  static genericEnergyRequest = async (requestURL: string): Promise<EnergyData[]> => {
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
      EnergyModel.selectLatestCompleteElectricityEntry(),
      EnergyModel.selectLatestCompleteGasEntry(),
    ]);

    const electricStartDate = dateUtils.addTime(electricEndDate, 0, 0, -1);
    const gasStartDate = dateUtils.addTime(gasEndDate, 0, 0, -1);

    const [electricityEntries, gasEntries] = await Promise.all([
      EnergyModel.selectElectricityEntry(electricStartDate, electricEndDate),
      EnergyModel.selectGasEntry(gasStartDate, gasEndDate),
    ]);

    const electricityUsage = electricityEntries.reduce(
      (partialSum, a) => partialSum + a.consumption,
      0,
    );
    const gasUsage = gasEntries.reduce((partialSum, a) => partialSum + a.consumption, 0);

    const [electricRate, gasRate] = await Promise.all([
      EnergyModel.selectLatestElectricityRateAndCharge(),
      EnergyModel.selectLatestGasRateAndCharge(),
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
}

export default EnergyUtils;
