const fs = require("fs");
const axios = require("axios");

exports.downloadFile = (fileUrl, outputLocationPath) => {
  if (!fs.existsSync("./cache/")) fs.mkdirSync("./cache/");
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: "get",
        url: fileUrl,
        responseType: "stream",
      });
      const writer = fs.createWriteStream(outputLocationPath);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    } catch (err) {
      if (err.response.status === 404) {
        reject({ status: 404, content: "/static/assets/pokemon/not-found.png" });
      } else reject(err);
    }
  });
};

exports.getUniqueListBy = (arr, key1) => {
  return [...new Map(arr.map((item) => [item[key1], item])).values()];
};

exports.compare = (a, b, key) => {
  if (a[key] < b[key]) {
    return -1;
  }
  if (a[key] > b[key]) {
    return 1;
  }
  return 0;
};

exports.sortmoves = (moves) => {
  let level = [];
  let tmvm = [];
  let tutor = [];
  let egg = [];
  let result = [];

  for (const move of moves) {
    if (move.method === "TM/VM") tmvm.push(move);
    else if (move.method === "Erlernt - Tutor") tutor.push(move);
    else if (move.method === "Ei - Egg") egg.push(move);
    else level.push(move);
  }

  result.push(level.sort((a, b) => this.compare(a, b, "method")));
  result.push(egg.sort((a, b) => this.compare(a, b, "type")));
  result.push(tmvm.sort((a, b) => this.compare(a, b, "type")));
  result.push(tutor.sort((a, b) => this.compare(a, b), "type"));

  return result.flat();
};
