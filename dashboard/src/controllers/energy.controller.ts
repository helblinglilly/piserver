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
import { rmSync } from "fs";

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

  static getBills = async (
    req: express.Request<unknown, unknown, unknown, HourlyViewQuery>,
    res: express.Response,
  ) => {
    if (!req.query.mode) {
      // TODO display error page here
      log.error("A request was made to getHourlyUsage with no mode selected");
      return;
    }

    const mode = req.query.mode === "gas" ? "gas" : "electric";
    const billing_table =
      mode === "gas" ? TableNames.gas_bill : TableNames.electricity_bill;

    const data = await EnergyBillModel.selectBill(billing_table);

    const usageDataPoints: Array<number> = [];
    const standingDataPoints: Array<number> = [];
    const kWhDataPoints: Array<number> = [];
    const pricesDataPoints: Array<number> = [];
    const labels: Array<string> = [];

    data.forEach((entry) => {
      usageDataPoints.push(entry.usage_kwh);
      standingDataPoints.push(entry.standing_order_rate);
      kWhDataPoints.push(entry.rate_kwh);
      pricesDataPoints.push(entry.after_tax);
      labels.push(entry.billing_end.toLocaleDateString("en-GB"));
    });

    const highestUsage = Math.max.apply(null, usageDataPoints);
    const highestStandingCharge = Math.max.apply(null, standingDataPoints);
    const highestkWhRate = Math.max.apply(null, kWhDataPoints);
    const highestPrice = Math.max.apply(null, pricesDataPoints);

    const chart_usage_data = JSON.stringify({
      data: {
        labels: labels,
        datasets: [
          {
            pointRadius: 4,
            pointBackgroundColor: "rgb(0,0,255)",
            data: usageDataPoints,
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
                suggestedMin: 0,
                suggestedMax: highestUsage + 10,
              },
            },
          ],
        },
        title: {
          display: true,
          text: "kWh usage at billing date",
        },
      },
    });

    const chart_standing_charge_data = JSON.stringify({
      data: {
        labels: labels,
        datasets: [
          {
            pointRadius: 4,
            pointBackgroundColor: "rgb(0,0,255)",
            data: standingDataPoints,
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
                suggestedMin: 0,
                suggestedMax: highestStandingCharge + 5,
              },
            },
          ],
        },
        title: {
          display: true,
          text: "Standing charge rate (pennies/day)",
        },
      },
    });

    const chart_kwh_rate_data = JSON.stringify({
      data: {
        labels: labels,
        datasets: [
          {
            pointRadius: 4,
            pointBackgroundColor: "rgb(0,0,255)",
            data: kWhDataPoints,
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
                suggestedMin: 0,
                suggestedMax: highestkWhRate + 5,
              },
            },
          ],
        },
        title: {
          display: true,
          text: "kWh unit rate",
        },
      },
    });

    const chart_price_data = JSON.stringify({
      data: {
        labels: labels,
        datasets: [
          {
            pointRadius: 4,
            pointBackgroundColor: "rgb(0,0,255)",
            data: pricesDataPoints,
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
                suggestedMin: 0,
                suggestedMax: highestPrice + 10,
              },
            },
          ],
        },
        title: {
          display: true,
          text: "Pounds charged",
        },
      },
    });

    const options = {
      username: req.headers["x-username"],
      mode: mode === "gas" ? "Gas" : "Electric",
      otherMode: mode === "gas" ? "Electric" : "Gas",
      chart_usage_data: chart_usage_data,
      chart_standing_charge_data: chart_standing_charge_data,
      chart_kwh_rate_data: chart_kwh_rate_data,
      chart_price_data: chart_price_data,
    };

    res.render("energy/bills", { ...options });
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

  static getInsert = async (
    req: express.Request<unknown, unknown, unknown, HourlyViewQuery>,
    res: express.Response,
  ) => {
    if (!req.query.mode) {
      log.error("getInsert received a query without 'mode' set as a query");
    }

    const billTable =
      req.query.mode === "gas" ? TableNames.gas_bill : TableNames.electricity_bill;
    const latestBill = await EnergyBillModel.selectLatestBill(billTable);

    const options = {
      username: req.headers["x-username"],
      mode: req.query.mode,
      default_start: new Date(latestBill.billing_end),
      default_end: new Date(),
      latest_standing_order_rate: latestBill.standing_order_rate,
      latest_kwh_used: latestBill.usage_kwh,
      latest_kwh_rate: latestBill.rate_kwh,
    };

    res.render("energy/insert_bill", { ...options });
  };

  static getInsertElectric = async (req: express.Request, res: express.Response) => {
    res.sendStatus(200);
  };

  static getInsertGas = async (req: express.Request, res: express.Response) => {
    res.sendStatus(200);
  };

  static postInsert = async (req: express.Request, res: express.Response) => {
    if (!req.query.mode) {
      log.error("postInsert received a query without 'mode' set");
      res.sendStatus(400);
      return;
    }
    const billTable =
      req.query.mode === "gas" ? TableNames.gas_bill : TableNames.electricity_bill;

    const startDate = new Date(req.body.start_date);
    const endDate = new Date(req.body.end_date);

    if (startDate > endDate) {
      res.sendStatus(400);
      return;
    }

    const standingChargeDays = parseInt(req.body.standing_charge_days);
    const standingChargeRate = parseFloat(req.body.standing_charge_days);
    const unitsUsed = parseFloat(req.body.units_used);
    const unitPrice = parseFloat(req.body.unit_price);
    const energyCharge = unitsUsed * unitPrice;
    const beforeTax = standingChargeDays + energyCharge;

    await EnergyBillModel.insertBill(
      billTable,
      startDate,
      endDate,
      standingChargeDays,
      standingChargeRate,
      unitsUsed,
      unitPrice,
      beforeTax,
      beforeTax * 1.05,
    );

    res.redirect("/energy");
  };
}

export default EnergyController;
