import { getLogger } from "loglevel";
import "./log.utils";
const dotenv = require("dotenv").config();
import axios from "axios";
import EnergyModel from "../models/energy.model";
import dateUtils from "./date.utils";
import { EnergyData } from "../types/energy.types";

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

    const response = await axios.get(requestURL, {
      auth: {
        username: process.env.OCTOPUS_API_KEY,
        password: this.baseURL,
      },
    });

    if (response.status === 400)
      log.error(`Request failed with error 400 for ${requestURL}`);

    if (response.status !== 200)
      log.error(
        `Request failed with error ${response.status} ${response.statusText} for ${requestURL}`,
      );

    return response.data.results;
  };

  static yesterdaySummary = async () => {
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    startDate = new Date(startDate.valueOf() - timezoneOffset);

    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const electricity = await EnergyModel.selectElectricityEntry(startDate, endDate);
    const gas = await EnergyModel.selectGasEntry(startDate, endDate);

    const electricityUsed = electricity.reduce(
      (partialSum, a) => partialSum + a.usage_kwh,
      0,
    );
    const gasUsed = gas.reduce((partialSum, a) => partialSum + a.usage_kwh, 0);

    const electricityRate = await EnergyModel.selectLatestElectricityRateAndCharge();
    const gasRate = await EnergyModel.selectLatestGasRateAndCharge();

    return {
      electricityUsage: electricityUsed.toFixed(3) + "kWh",
      gasUsage: gasUsed.toFixed(3) + "kWh",
      electricityPrice:
        "£" + ((electricityUsed * electricityRate.rate_kwh) / 100).toFixed(2),
      gasPrice: "£" + ((gasUsed * gasRate.rate_kwh) / 100).toFixed(2),
    };
  };
}

export default EnergyUtils;
