import log from "loglevel";
log.disableAll();

import network from "../../../utils/network.utils";
import fs from "fs";

const testFolder = "./__tests__/utils/testfolder";

afterEach(() => {
  try {
    fs.rmSync(testFolder, { recursive: true });
  } catch {
    return;
  }
});

describe("createFolderForFile", () => {
  const testFilePath = "./__tests__/utils/testfolder/test.png";
  const testFolderName = "testfolder";

  // TODO Add testfolder to gitignore
  test("Can successfully create a folder", () => {
    expect(network.createFolderForFile(testFilePath)).toBe(true);
    const dirlist = fs.readdirSync("./__tests__/utils");
    expect(dirlist.includes(testFolderName)).toBe(true);
  });

  test("If folder already exists, it recognises that", () => {
    try {
      fs.mkdirSync(testFolder);
    } catch {
      return;
    }
    expect(network.createFolderForFile(testFilePath)).toBe(true);
  });

  test("Can created nested folder structure", () => {
    expect(network.createFolderForFile(testFolder + "/another/layer/deep.txt")).toBe(
      true,
    );
  });

  test("Will fail gracefully for root dir", () => {
    expect(network.createFolderForFile("/root.txt")).toBe(false);
  });

  test("Will fail when a folder is supplies, and not a file", () => {
    expect(network.createFolderForFile(testFolder)).toBe(false);
  });
});

describe("downloadFile", () => {
  const url = "https://http.cat/100";
  const filepath = "./__tests__/utils/testfolder/100.jpg";

  test("Can succesfully download file", async () => {
    await network.downloadFile(url, filepath);
    expect(fs.readdirSync(testFolder).includes("100.jpg")).toBe(true);
  });
  test("Will override existing file with a new copy", async () => {
    await network.downloadFile(url, filepath);
    const originalCreateTimestamp = fs.statSync(filepath).birthtime;
    await network.downloadFile(url, filepath);
    expect(fs.readdirSync(testFolder).includes("100.jpg")).toBe(true);

    const newCreateTimestamp = fs.statSync(filepath).birthtime;
    expect(originalCreateTimestamp).not.toBe(newCreateTimestamp);
  });

  test("Will fail gracefully if proposed file location is not valid", async () => {
    try {
      await network.downloadFile(url, "/some/folder");
    } catch (err) {
      expect(err).toBe("Failed to create folder for file /some/folder");
    }
  });

  test("Will reject if http request fails", async () => {
    try {
      await network.downloadFile("coolstuff", filepath);
    } catch (err) {
      expect(err.code).toBe("ECONNREFUSED");
    }
  });
});
