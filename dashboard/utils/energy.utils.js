const dotenv = require("dotenv").config();
const axios = require("axios").default;
const model = require("../models/energy.model");
const utils = require("../utils");
const dateUtils = require("../utils/date.utils");

const baseURL = "https://api.octopus.energy/";
const defaultPageSize = 500;
const maximumPageSize = 20000;

const getAppropriatePageSize = (daysToFetch) => {
  const requiredEntries = 24 * 2 * daysToFetch;

  if (requiredEntries < defaultPageSize) return defaultPageSize;
  else if (requiredEntries > maximumPageSize) return maximumPageSize;
  else return requiredEntries + 10;
};

exports.updateReadings = async () => {
  const todaysDate = new Date(new Date().toISOString().split("T")[0]);
  let latestGasDate = await model.selectLatestGasEntryInsert();
  // Gas entries are usually a bit delayed
  let latestElectricityDate = await model.selectLatestElectricityEntryInsert();

  if (
    latestElectricityDate.toLocaleDateString("en-GB") ==
    todaysDate.toLocaleDateString("en-GB")
  ) {
    return;
  }

  const electricityDaysToFetch = dateUtils.daysBetweenTwoDates(
    latestElectricityDate,
    new Date(),
  );
  const electricityPageSize = getAppropriatePageSize(electricityDaysToFetch);

  const gasDaysToFetch = dateUtils.daysBetweenTwoDates(
    new Date(latestGasDate),
    new Date(),
  );
  const gasPageSize = getAppropriatePageSize(gasDaysToFetch);

  const electricityData = await fetchElectricityReading(
    electricityPageSize,
    latestElectricityDate.toISOString(),
  );
  const gasData = await fetchGasReading(gasPageSize, latestGasDate.toISOString());

  electricityData.forEach(async (entry) => {
    await model.insertElectricityEntry(
      entry.interval_start,
      entry.interval_end,
      entry.consumption,
    );
  });

  gasData.forEach(async (entry) => {
    await model.insertGasEntry(
      entry.interval_start,
      entry.interval_end,
      // Gas comes in m^3, we need to convert it to kWh
      (entry.consumption * 1.02264 * 40.1) / 3.6,
    );
  });
};

const fetchElectricityReading = async (
  pageSize = 100,
  from = null,
  to = null,
  orderBy = "period",
) => {
  let requestURL = `${baseURL}v1/electricity-meter-points/${process.env.OCTOPUS_ELECTRIC_MPAN}/meters/${process.env.OCTOPUS_ELECTRIC_SERIAL}/consumption/`;

  requestURL += `?page_size=${pageSize}`;
  if (from != null) requestURL += `&period_from=${from}`;
  if (to != null) requestURL += `&period_to=${to}`;
  requestURL += `&order_by=${orderBy}`;

  return await genericRequest(requestURL);
};

const fetchGasReading = async (
  pageSize = 100,
  from = null,
  to = null,
  orderBy = "period",
) => {
  let requestURL = `${baseURL}v1/gas-meter-points/${process.env.OCTOPUS_GAS_MPRN}/meters/${process.env.OCTOPUS_GAS_SERIAL}/consumption/`;

  requestURL += `?page_size=${pageSize}`;
  if (from != null) requestURL += `&period_from=${from}`;
  if (to != null) requestURL += `&period_to=${to}`;
  requestURL += `&order_by=${orderBy}`;

  return await genericRequest(requestURL);
};

const genericRequest = async (requestURL) => {
  console.log(requestURL);
  const response = await axios.get(requestURL, {
    auth: {
      username: process.env.OCTOPUS_API_KEY,
      password: baseURL,
    },
  });

  if (response.status === 400) {
    console.log(`Bad request for ${requestURL}`);
  }

  if (response.status !== 200) {
    return null;
  }

  return response.data.results;
};

exports.chartDataForDateRange = async (startDate, endDate, mode) => {
  let entries;
  let highestValue;
  let title = `${startDate.toLocaleDateString("en-GB")}-${endDate.toLocaleDateString(
    "en-GB",
  )}`;
  let meta;

  if (mode.toLowerCase() === "electric") {
    entries = await model.selectElectricityEntry(startDate, endDate);
    meta = await model.selectLatestElectricityRateAndCharge();
    highestValue = 5;
  } else {
    entries = await model.selectGasEntry(startDate, endDate);
    meta = await model.selectLatestGasRateAndCharge();
    highestValue = 90;
  }

  const dataPoints = [];
  const labels = [];

  let currentDateString = "";
  let dailyUsage = 0.0;

  entries.forEach((entry, i) => {
    const day = dateUtils.weekdays.short[entry.start_date.getUTCDay()];
    const date = entry.start_date.getUTCDate();
    const month = entry.start_date.getUTCMonth() + 1;
    const entryDate = `${day} ${date}/${month}`;

    if (i === 0) currentDateString = entryDate;

    if (entryDate !== currentDateString) {
      dataPoints.push(parseFloat(dailyUsage.toFixed(5)));
      labels.push(currentDateString);

      dailyUsage = parseFloat(entry.usage_kwh);
      currentDateString = entryDate;
    } else {
      dailyUsage += parseFloat(entry.usage_kwh);
    }
  });

  const chart = generateChart(title, dataPoints, labels, highestValue, "kWh");
  let totalUsage = dataPoints.reduce((rolling, val) => rolling + val, 0);
  let charge = totalUsage * parseFloat(meta.rate_kwh);

  return {
    data: dataPoints,
    labels: labels,
    chart: chart,
    energyUsed: `${totalUsage.toFixed(2)} kWh`,
    charged: "£" + (charge / 100).toFixed(2),
    rate: `@${meta.rate_kwh}p/kWh`,
  };
};

exports.chartDataForDay = async (startDate, endDate, mode) => {
  let entries;
  let title = `${startDate.toLocaleDateString("en-GB")}`;
  let meta;
  let highestValue = 0;

  if (mode.toLowerCase() === "electric") {
    entries = await model.selectElectricityEntry(startDate, endDate);
    meta = await model.selectLatestElectricityRateAndCharge();
    highestValue = 5;
  } else {
    entries = await model.selectGasEntry(startDate, endDate);
    meta = await model.selectLatestGasRateAndCharge();
    highestValue = 90;
  }

  const dataPoints = [];
  const labels = [];
  let energyUsed = 0.0;

  entries.forEach((entry, i) => {
    const usage = parseFloat(entry.usage_kwh);

    if (i === 0) dataPoints.push(parseFloat(usage.toFixed(5)));
    else {
      dataPoints.push(parseFloat((dataPoints[dataPoints.length - 1] + usage).toFixed(5)));
      energyUsed += usage;
    }

    const start_range_time = entry.start_date.toUTCString().split(" ")[4].split(":");
    const end_range_time = entry.end_date.toUTCString().split(" ")[4].split(":");

    const label = `${start_range_time[0]}:${start_range_time[1]}-${end_range_time[0]}:${end_range_time[1]}`;
    labels.push(label);
  });

  const chart = generateChart(title, dataPoints, labels, highestValue, "kWh");
  let charge = energyUsed * parseFloat(meta.rate_kwh / 100);

  return {
    data: dataPoints,
    labels: labels,
    chart: chart,
    energyUsed: `${energyUsed.toFixed(2)} kWh`,
    charged: "£" + charge.toFixed(2),
    rate: `@${meta.rate_kwh}p/kWh`,
  };
};

const generateChart = (title, data, labels, max, yName) => {
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

exports.fetchLatestDay = async () => {
  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  startDate.setMilliseconds(0);
  startDate = new Date(startDate - timezoneOffset);

  let endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  const electricity = await model.selectElectricityEntry(startDate, endDate);
  const gas = await model.selectGasEntry(startDate, endDate);

  const electricityUsed = electricity.reduce(
    (partialSum, a) => partialSum + a.usage_kwh,
    0,
  );
  const gasUsed = gas.reduce((partialSum, a) => partialSum + a.usage_kwh, 0);

  const electricityRate = await model.selectLatestElectricityRateAndCharge();
  const gasRate = await model.selectLatestGasRateAndCharge();

  // console.log(electricityRate);
  return {
    electricityUsage: electricityUsed.toFixed(3) + "kWh",
    gasUsage: gasUsed.toFixed(3) + "kWh",
    electricityPrice:
      "£" + ((electricityUsed * electricityRate.rate_kwh) / 100).toFixed(2),
    gasPrice: "£" + ((gasUsed * gasRate.rate_kwh) / 100).toFixed(2),
  };
};
