const network = require("../../utils/network.utils");
const fs = require("fs");

const testFolder = "./__tests__/utils/testfolder";

describe("createFolderForFile", () => {
  const testFilePath = "./__tests__/utils/testfolder/test.png";
  const testFolderName = "testfolder";

  beforeAll(() => {
    try {
      fs.rmdirSync(testFolder);
    } catch {
      return;
    }
  });
  afterEach(() => {
    try {
      fs.rmdirSync(testFolder);
    } catch {
      return;
    }
  });
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
});

describe("downloadFile", () => {
  const url = "https://http.cat/100";
  const filepath = "./__tests__/utils/testfolder/100.jpg";

  beforeAll(() => {
    try {
      fs.rmdirSync("./__tests__/utils/testfolder/");
    } catch {
      return;
    }
  });
  test("Can succesfully download file", async () => {
    await network.downloadFile(url, filepath);
    expect(fs.readdirSync(testFolder).includes("100.jpg")).toBe(true);
  });
  test("Will override existing file with a new copy", async () => {
    const originalCreateTimestamp = fs.statSync(filepath).birthtime;
    await network.downloadFile(url, filepath);
    expect(fs.readdirSync(testFolder).includes("100.jpg")).toBe(true);

    const newCreateTimestamp = fs.statSync(filepath).birthtime;
    expect(originalCreateTimestamp).not.toBe(newCreateTimestamp);

    fs.rmSync(filepath);
    fs.rmdirSync(testFolder);
  });
});
