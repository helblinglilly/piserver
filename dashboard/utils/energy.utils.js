const dotenv = require("dotenv").config();
const axios = require("axios").default;
const model = require("../models/energy.model");
const utils = require("../utils");

const baseURL = "https://api.octopus.energy/";
const defaultPageSize = 100;
const maximumPageSize = 20000;

const getAppropriatePageSize = (daysToFetch) => {
  const requiredEntries = 24 * 2 * daysToFetch;

  if (requiredEntries < defaultPageSize) return defaultPageSize;
  else if (requiredEntries > maximumPageSize) return maximumPageSize;
  else return requiredEntries + 10;
};

exports.updateReadings = async () => {
  const todaysDate = new Date(new Date().toISOString().split("T")[0]);
  let latestGasDate = await model.selectLatestGasEntry();
  let latestElectricityDate = await model.selectLatestElectricityEntry();

  if (
    latestElectricityDate.toLocaleDateString("en-GB") ==
    todaysDate.toLocaleDateString("en-GB")
  ) {
    return;
  }

  const electricityDaysToFetch = utils.daysBetweenTwoDates(
    latestElectricityDate,
    new Date(),
  );
  const electricityPageSize = getAppropriatePageSize(electricityDaysToFetch);

  const gasDaysToFetch = utils.daysBetweenTwoDates(new Date(latestGasDate), new Date());
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
      entry.consumption,
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

exports.getDataBetweenDates = async (startDate, endDate, mode, labelMode) => {
  let entries;

  if (mode.toLowerCase() === "electric")
    entries = await model.selectElectricityEntry(startDate, endDate);
  else entries = await model.selectGasEntry(startDate, endDate);

  const dataPoint = [];
  const labels = [];

  entries.forEach((entry) => {
    const usage = parseFloat(entry.usage_kwh);

    if (dataPoint.length === 0) {
      dataPoint.push(parseFloat(usage.toFixed(5)));
    } else {
      dataPoint.push(parseFloat((dataPoint[dataPoint.length - 1] + usage).toFixed(5)));
    }

    if (labelMode === "time") {
      const start_range_time = entry.start_date.toUTCString().split(" ")[4].split(":");
      const end_range_time = entry.end_date.toUTCString().split(" ")[4].split(":");

      const label = `${start_range_time[0]}:${start_range_time[1]}-${end_range_time[0]}:${end_range_time[1]}`;
      labels.push(label);
    } else if (labelMode === "date") {
      labels.push(entry.start_date.toLocaleDateString());
    }
  });

  const chart = {
    data: {
      labels: labels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: dataPoint,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            display: true,
          },
        ],
      },
      title: {
        display: true,
        text: `${startDate.toLocaleDateString("en-GB")} kWh`,
      },
    },
  };

  const meta = await model.selectLatestElectricityRateAndCharge();
  let charge = dataPoint[dataPoint.length - 1] * parseFloat(meta.rate_kwh);
  charge += parseFloat(meta.standing_order_rate);

  return {
    data: dataPoint,
    labels: labels,
    chart: chart,
    energyUsed: `${dataPoint[dataPoint.length - 1]} kWh`,
    charged: "£" + (charge / 100).toFixed(2),
  };
};
