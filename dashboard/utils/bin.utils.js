const fs = require("fs");
const csv = require("fast-csv");
const model = require("../models/bin.model");
const dateUtils = require("../utils/date.utils");
const networkUtils = require("../utils/network.utils");

let isDownloadingNewFile = false;
exports.getBinDates = async () => {
  const entries = await model.selectBinCollectionDatesByDate(new Date());
  if (entries.length === 0) {
    fetchFreshBinDates();
    return {
      BlackDate: "Loading...",
      BlackDay: " ",
      GreenDate: "Loading...",
      GreenDay: " ",
    };
  }

  const latestDates = {};
  for (let i = 0; i < entries.length; i++) {
    if (latestDates.BlackDate === undefined && entries[i].bin_type === "BLACK") {
      latestDates.BlackDate = entries[i].collection_date.toLocaleDateString("en-GB");
      latestDates.BlackDay = dateUtils.weekdays.long[entries[i].collection_date.getDay()];
    }

    if (latestDates.GreenDate === undefined && entries[i].bin_type === "GREEN") {
      latestDates.GreenDate = entries[i].collection_date.toLocaleDateString("en-GB");
      latestDates.GreenDay = dateUtils.weekdays.long[entries[i].collection_date.getDay()];
    }

    // Always at least one entry should be found first
    if (latestDates.BlackDate !== undefined && latestDates.GreenDate !== undefined)
      return latestDates;
  }

  // Either no black or green bin entry could be found - grab a new file
  fetchFreshBinDates();

  if (latestDates.BLACK === undefined) {
    latestDates.BlackDate = "Loading...";
    latestDates.BlackDay = " ";
  } else if (latestDates.GreenDate === undefined) {
    latestDates.GreenDate = "Loading...";
    latestDates.GreenDay = " ";
  }
  return latestDates;
};

const fetchFreshBinDates = async () => {
  if (isDownloadingNewFile === false) {
    isDownloadingNewFile = true;
    console.log("Grabbing a fresh bin dates file");
    const url = "https://opendata.leeds.gov.uk/downloads/bins/dm_jobs.csv";
    const filepath = `${__dirname}/../cache/waste.csv`;

    // Grab a fresh file
    const binDates = [];
    await networkUtils.downloadFile(url, filepath);

    // Process it only for our address
    const stream = fs.createReadStream(filepath);
    csv
      .parseStream(stream, { headers: false })
      .on("error", (error) => {
        console.log("Encountered error downloading bin data");
        console.log(error);
      })
      .on("data", function (data) {
        if (data[0] == process.env.ADDRESS_CODE) {
          if (data[1] === "BLACK") {
            binDates.push({ binType: "BLACK", collection: data[2] });
          } else if (data[1] === "GREEN") {
            binDates.push({ binType: "GREEN", collection: data[2] });
          }
        }
      })
      .on("end", function () {
        console.log("Finished downloading bin dates file");
        let completedEntries = 0;
        binDates.forEach(async (entry, i) => {
          const dateParts = entry.collection.split("/");
          const date = new Date("20" + dateParts[2], dateParts[1] - 1, dateParts[0]);
          try {
            await model.insertBinCollectionDate(entry.binType, date);
          } catch (err) {
            console.log(`Entry '${entry.binType}, ${date}' already exists`);
            console.log(err);
          }
          completedEntries++;

          if (completedEntries === binDates.length - 1) {
            fs.rmSync(filepath);
            isDownloadingNewFile = false;
            console.log("All new bin entries are loaded");
          }
        });
      });
  }
};
