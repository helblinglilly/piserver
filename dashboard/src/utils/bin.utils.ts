import log from "loglevel";
import fs from "fs";
import * as csv from "fast-csv";
import model from "../models/bin.model";
import networkUtils from "./network.utils";
import { BinDates, BinModelDateEntry } from "../types/bin.types";
import { WeekdayLong } from "../types/common.types";
import DateUtils from "./date.utils";

require("../utils/log.utils");
const logger = log.getLogger("bin-utils");
logger.setLevel(0);

const url = "https://opendata.leeds.gov.uk/downloads/bins/dm_jobs.csv";
const filepath = `${__dirname}/../cache/waste.csv`;

class BinUtils {
  static isDownloadingNewFile = false;

  static getBinDates = async (): Promise<BinDates> => {
    const entries = await model.selectBinCollectionDatesByDate(new Date());

    const latestDates: BinDates = {
      BlackDate: "Loading...",
      BlackDay: "",
      GreenDate: "Loading...",
      GreenDay: "",
    };

    if (entries.length === 0) {
      this.fetchFreshBinDates();
      return latestDates;
    }

    for (let i = 0; i < entries.length; i++) {
      if (latestDates.BlackDate === "Loading..." && entries[i].type === "BLACK") {
        latestDates.BlackDate = entries[i].date;
        latestDates.BlackDay = DateUtils.getWeekdayLong(entries[i].date.getDay());
      }

      if (latestDates.GreenDate === "Loading..." && entries[i].type === "GREEN") {
        latestDates.GreenDate = entries[i].date;
        latestDates.GreenDay = DateUtils.getWeekdayLong(entries[i].date.getDay());
      }
    }

    // If we get to this point, this means that no black or green bin entry could be found - grab a new file
    if (
      latestDates.BlackDate === "Loading..." &&
      latestDates.GreenDate === "Loading..."
    ) {
      this.fetchFreshBinDates();
    }

    return latestDates;
  };

  static fetchFreshBinDates = async (): Promise<any> => {
    if (this.isDownloadingNewFile) {
      logger.info(
        "Tried to grab a fresh bin dates file but a download is already active",
      );
      return;
    }

    this.isDownloadingNewFile = true;
    logger.info("Grabbing a fresh bin dates file");

    let downloadFailCount = 0;
    let downloadSuccessful = false;
    while (downloadFailCount < 5 && !downloadSuccessful) {
      try {
        await networkUtils.downloadFile(url, filepath);
        downloadSuccessful = true;
      } catch (err) {
        logger.warn(
          `Attempt ${downloadFailCount}/5 - Downloading new bin file failed. ${err}`,
        );
        downloadFailCount++;
      }
    }

    if (downloadFailCount === 5 && !downloadSuccessful)
      logger.error("After 5 attempts, still failed to download new bin date file");

    const stream = fs.createReadStream(filepath);

    const binDates: Array<BinModelDateEntry> = [];

    csv
      .parseStream(stream, { headers: false })
      .on("error", (err) => {
        logger.error(`Encountered error reading csv ${filepath} with error: ${err}`);
        return;
      })
      .on("data", (data) => {
        if (data[0] === process.env.ADDRESS_CODE) {
          const [day, month, year] = data[2].split("/");
          const date = new Date(parseInt("20" + year), month, day);

          if (data[1] === "BLACK") binDates.push({ type: "BLACK", date: date });
          else if (data[1] === "GREEN") binDates.push({ type: "GREEN", date: date });
        }
      })
      .on("end", () => {
        logger.info(`Finished process bin dates file with ${binDates.length} entries`);

        let completedEntries = 0;

        binDates.forEach(async (entry) => {
          try {
            await model.insertBinCollectionDate(entry);
          } catch {
            logger.warn(
              `Entry '${entry.type}, ${entry.date.toLocaleDateString(
                "en-GB",
              )}' already exists`,
            );
          }

          completedEntries++;

          if (completedEntries === binDates.length - 1) {
            fs.rmSync(filepath);
            logger.info("All new bin entries are loaded");
          }
        });
      });

    this.isDownloadingNewFile = false;
  };
}

export default BinUtils;
