export enum WeekdayLong {
  Mon = "Monday",
  Tue = "Tuesday",
  Wed = "Wednesday",
  Thu = "Thursday",
  Fri = "Friday",
  Sat = "Saturday",
  Sun = "Sunday",
}

export enum WeekdayShort {
  Mon = "Mon",
  Tue = "Tue",
  Wed = "Wed",
  Thu = "Thu",
  Fri = "Fri",
  Sat = "Sat",
  Sun = "Sun",
}

export enum TableNames {
  gas_bill = "gas_bill",
  electricity_bill = "electricity_bill",
  electricity_usage = "electricity_usage",
  gas_usage = "gas_usage",
}

export type ChartInput = {
  data: ChartData;
  options: ChartOptions;
};

type ChartData = {
  labels: Array<string>;
  datasets: Array<ChartDatasets>;
};

type ChartDatasets = {
  pointRadius: 4;
  pointBackgroundColor: string; // An RGB value
  data: Array<number>;
};

type ChartOptions = {
  responsive: boolean;
  maintainAspectRatio: boolean;
  legend: ChartLegend;
  scales: ChartScales;
  title: ChartTitle;
};

type ChartLegend = {
  display: boolean;
};

type ChartScales = {
  yAxes: Array<ChartAxes>;
};

type ChartAxes = {
  display: boolean;
  ticks: ChartTicks;
  scaleLabel: ChartScaleLabel;
};

type ChartTicks = {
  max: number;
  min: number;
};

type ChartScaleLabel = {
  display: boolean;
  labelString: string;
};

type ChartTitle = {
  display: boolean;
  text: string;
};

export type UsernameOptions = {
  username: string;
};
