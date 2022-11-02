import { getLogger } from "loglevel";
import "../utils/log.utils";
import express from "express";
const log = getLogger("energy.controller");

import usageModel from "../models/energy.usage.model";
import billModel from "../models/energy.bill.model";
import error from "./error.controller";
import EnergyUtils from "../utils/energy.utils";
import { TableNames, UsernameOptions } from "../types/common.types";
import { GetHourlyOptions, HourlyViewQuery } from "../types/energy.types";
import DateUtils from "../utils/date.utils";
import EnergyUsageModel from "../models/energy.usage.model";
import EnergyBillModel from "../models/energy.bill.model";

class EnergyController {
  static getRoot = async (req: express.Request, res: express.Response) => {
    const options: UsernameOptions = {
      username: req.headers["x-username"].toString(),
    };
    await EnergyUtils.updateReadings();

    res.render("energy/index", { ...options });
  };

  static getHourlyUsage = async (
    req: express.Request<unknown, unknown, unknown, HourlyViewQuery>,
    res: express.Response,
  ) => {
    if (!req.query.mode) {
      // TODO display error page here
      log.error("A request was made to getHourlyUsage with no mode selected");
      return;
    }

    const mode = req.query.mode === "gas" ? "gas" : "electric";
    const tableName =
      mode === "gas" ? TableNames.gas_usage : TableNames.electricity_usage;

    let startDate: Date, endDate: Date;
    const latestEntry = await EnergyUsageModel.selectLatestCompletedDate(tableName);

    if (req.query.daily_date) {
      req.query.daily_date = new Date(req.query.daily_date);
      req.query.daily_date.setHours(0);
      req.query.daily_date.setMinutes(0);
      req.query.daily_date.setMilliseconds(0);

      startDate = req.query.daily_date;
      endDate = new Date(startDate.toISOString());
      endDate.setDate(startDate.getDate() + 1);
    }

    if (!endDate || endDate > latestEntry) {
      endDate = latestEntry;
      startDate = DateUtils.yesterday();
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
    }

    const chartData = await EnergyUtils.chartDataSpecificDate(startDate, endDate, mode);

    const options: GetHourlyOptions = {
      username: req.headers["x-username"].toString(),
      date: startDate,
      mode: mode === "gas" ? "Gas" : "Electric",
      otherMode: mode === "gas" ? "Electric" : "Gas",
      hasData: chartData.data[chartData.data.length - 1] == undefined ? false : true,
      chart_data: JSON.stringify(chartData.chart),
      energy_used: chartData.energyUsed,
      energy_charged: chartData.charged,
      rate: chartData.rate,
      maxDate: new Date(latestEntry.valueOf() - 1),
    };

    res.render("energy/view_hourly", { ...options });
  };

  static getBills = async (req: express.Request, res: express.Response) => {
    res.sendStatus(200);
  };

  static getViewMonthly = async (
    req: express.Request<unknown, unknown, unknown, HourlyViewQuery>,
    res: express.Response,
  ) => {
    if (!req.query.mode) {
      // TODO display error page here
      log.error("A request was made to getViewMonthly with no mode selected");
      return;
    }

    const mode = req.query.mode === "gas" ? "gas" : "electric";
    let selectedDate = req.query.daily_date ? new Date(req.query.daily_date) : new Date();

    const billDates = await EnergyBillModel.selectBillingPeriodFromDate(selectedDate);
    const chartData = await EnergyUtils.chartDataDateRange(
      billDates.start_date,
      billDates.end_date,
      mode,
    );

    const options = {
      username: req.headers["x-username"],
      selected_date: selectedDate,
      start_date: billDates.start_date,
      end_date: billDates.end_date,
      mode: mode === "gas" ? "Gas" : "Electric",
      otherMode: mode === "gas" ? "Electric" : "Gas",
      hasData: chartData.data[chartData.data.length - 1] == undefined ? false : true,
      chart_data: JSON.stringify(chartData.chart),
      energy_used: chartData.energyUsed,
      energy_charged: chartData.charged,
      rate: chartData.rate,
    };

    res.render("energy/view_monthly", { ...options });
  };

  static getInsertElectric = async (req: express.Request, res: express.Response) => {
    res.sendStatus(200);
  };

  static getInsertGas = async (req: express.Request, res: express.Response) => {
    res.sendStatus(200);
  };

  static postInsert = async (req: express.Request, res: express.Response) => {
    res.sendStatus(200);
  };
}

export default EnergyController;
