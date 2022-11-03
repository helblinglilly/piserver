import { ChartInput, UsernameOptions } from "./common.types";

export type EnergyUsage = {
  interval_start: Date;
  interval_end: Date;
  consumption: number;
};

export type DaySummary = {
  electric: DayDetails;
  gas: DayDetails;
};

export type DayDetails = {
  date: Date;
  usage: string;
  price: string;
};

export type Bill = {
  billing_start: Date;
  billing_end: Date;
  standing_order_charge_days: number;
  standing_order_rate: number;
  usage_kwh: number;
  rate_kwh: number;
  pre_tax: number;
  after_tax: number;
};

export type StandingChargeInfo = {
  standing_order_rate: number;
  rate_kwh: number;
};

export type BillingPeriod = {
  start_date: Date;
  end_date: Date;
};

export type ChartData = {
  data: Array<number>;
  labels: Array<string>;
  chart: ChartInput;
  energyUsed: string;
  charged: string;
  rate: string;
};

export type HourlyViewQuery = {
  mode: "gas" | "electric";
  daily_date: Date;
};

export interface GetHourlyOptions extends UsernameOptions {
  date: Date;
  mode: "Gas" | "Electric";
  otherMode: "Gas" | "Electric";
  hasData: boolean;
  chart_data: string;
  energy_used: string;
  energy_charged: string;
  rate: string;
  maxDate: Date;
}