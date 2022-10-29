export type EnergyData = {
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
