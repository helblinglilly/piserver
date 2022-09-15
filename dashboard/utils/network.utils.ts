import fs from "fs";
import axios from "axios";
import log from "loglevel";

const logger = log.getLogger("network-utils");

export const createFolderForFile = (path: string): boolean => {
  const outputPathParts: Array<string> = path.split("/");
  const filename = outputPathParts.pop();
  const outputFolder = outputPathParts.join("/");

  if (!fs.existsSync(outputFolder)) {
    try {
      fs.mkdirSync(outputFolder);
      logger.info(`Created folder ${outputFolder} for file ${filename}`);
    } catch {
      logger.error(`Failed to create directory ${outputFolder} for file ${filename}`);
      return false;
    }
  }
  return true;
};

export const downloadFile = async (url: string, output: string) => {
  logger.debug(`Downloading ${url} into ${output}`);
  return new Promise(async (resolve, reject) => {
    if (createFolderForFile(output) === false)
      reject(`Failed to create folder for file ${output}`);
    try {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
      });
      const writer = fs.createWriteStream(output);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    } catch (err) {
      logger.warn(`Download failed for ${url} into ${output}. Error: ${err}`);
      reject(err);
    }
  });
};
