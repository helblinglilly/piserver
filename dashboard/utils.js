const fs = require("fs");
const axios = require("axios");

weekday = () => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[new Date().getDay()];
};

exports.today = () => {
  const date = new Date();
  return `${weekday()}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

exports.todayIso = () => {
  const date = new Date();
  return date.toISOString().substring(0, 10);
};

exports.addTime = (startTime, addTime = { hours: 0, minutes: 0 }) => {
  if (!startTime || !addTime) throw "Invalid Argument - empty";
  else if (typeof startTime !== "object")
    throw "Invalid Argument - startTime is not DateTime";
  else if (typeof addTime !== "object")
    throw "Invalid Argument - addTime is not an object";

  var copiedDate = new Date(
    Date.UTC(
      startTime.getFullYear(),
      startTime.getMonth(),
      startTime.getDate(),
      startTime.getHours() + addTime.hours,
      startTime.getMinutes() + addTime.minutes,
      startTime.getSeconds(),
    ),
  );

  return copiedDate;
};

exports.isShortTime = (allegedTime) => {
  if (typeof allegedTime !== "string") return false;

  const result = allegedTime.match("/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/");
  if (result === null) return true;
  return result;
};

exports.dateTimetoHourMinute = (date) => {
  if (date === undefined) throw "Invalid Argument - empty";
  else if (typeof date !== "object") throw "Invalid Argument - Not an object";

  let hours = date.toTimeString().split(":")[0];
  let minutes = date.toTimeString().split(":")[1];
  return `${hours}:${minutes}`;
};

exports.constructUTCDateTime = (day, time) => {
  if (day === undefined || time === undefined) throw "Invalid Argument - empty";
  else if (typeof day !== "object") throw "Invalid Argument - Not an object";
  else if (typeof time !== "string") throw "Invalid Argument - Not a string";

  const dateTime = new Date(
    Date.UTC(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      time.split(":")[0],
      time.split(":")[1],
    ),
  );
  return dateTime;
};

exports.highestPokedexEntry = 898;

exports.pokemonNameLanguage = (species, languageCode) => {
  let name = "";
  species.names.forEach((entry) => {
    if (entry.language.name === languageCode) {
      name = entry.name;
    }
  });
  return name;
};

exports.itemNameLanguage = (item, languageCode) => {
  let name = "";
  item.names.forEach((entry) => {
    if (entry.language.name === languageCode) {
      name = entry.name;
    }
  });
  return name;
};

exports.itemFlavourTextLanguage = (item, languageCode) => {
  let texts = [];
  let previousText = "";

  item.flavor_text_entries.forEach((entry) => {
    if (entry.language.name === languageCode) {
      if (previousText != entry.text) {
        const gen = this.generationLanguage(entry.version_group.name);

        const i = {};
        entry.text = entry.text.replace(/\n/g, " ");
        if (entry.text == "- - -") {
          i.generation = gen.generation;
          i.generationName = gen[languageCode];
          i.text = "n/a";
          i.text = "n/a";
        } else {
          i.generation = gen.generation;
          i.generationName = gen[languageCode];
          i.text = entry.text;
        }

        // German entries tend to be duplicates of each other
        let found = false;
        texts.forEach((text) => {
          if (text.text == i.text) found = true;
        });

        if (!found) texts.push(i);

        previousText = entry.text;
      }
    }
  });

  return texts;
};

exports.generationLanguage = (version_group_name) => {
  const lookup = {
    "red-blue": {
      de: "Rot / Blau",
      en: "Red / Blue",
      generation: 1,
    },
    yellow: {
      de: "Gelb",
      en: "Yellow",
      generation: 1,
    },
    "gold-silver": {
      de: "Gold / Silber",
      en: "Gold / Silver",
      generation: 2,
    },
    crystal: {
      de: "Kristall",
      en: "Crystal",
      generation: 3,
    },
    "ruby-sapphire": {
      de: "Rubin / Saphir",
      en: "Ruby / Sapphire",
      generation: 3,
    },
    emerald: {
      de: "Smaragd",
      en: "Emerald",
      generation: 3,
    },
    "firered-leafgreen": {
      de: "Feuer Rot / Blatt Grün",
      en: "Fire Red / Leaf Green",
      generation: 3,
    },
    colosseum: {
      de: "Kolosseum",
      en: "Colosseum",
      generation: 3,
    },
    xd: {
      de: "XD",
      en: "XD",
      generation: 3,
    },
    "diamond-pearl": {
      de: "Diamant / Perle",
      en: "Diamond / Perl",
      generation: 4,
    },
    platinum: {
      de: "Platin",
      en: "Platinum",
      generation: 4,
    },
    "heartgold-soulsilver": {
      de: "Heartgold / Soulsilver",
      en: "Heartgold / Soulsilver",
      generation: 4,
    },
    "black-white": {
      de: "Schwarz / Weiss",
      en: "Black / White",
      generation: 5,
    },
    "black-2-white-2": {
      de: "Schwarz 2 / Weiss 2",
      en: "Black 2 / White 2",
      generation: 5,
    },
    "x-y": {
      de: "X / Y",
      en: "X / Y",
      generation: 6,
    },
    "omega-ruby-alpha-sapphire": {
      de: "Omega Rubin / Alpha Saphir",
      en: "Omega Ruby / Alpha Sapphire",
      generation: 6,
    },
    "sun-moon": {
      de: "Sonne / Mond",
      en: "Sun / Moon",
      generation: 7,
    },
    "ultra-sun-ultra-moon": {
      de: "Ultra Sonne / Ultra Mond",
      en: "Ultra Sun / Ultra Moon",
      generation: 7,
    },
    "lets-go-pikachu-lets-go-eevee": {
      de: "Let's Go Pikachu / Evoli",
      en: "Let's Go Pikachu / Eevee",
      generation: 7,
    },
    "sword-shield": {
      de: "Schwert / Schild",
      en: "Sword / Shield",
      generation: 8,
    },
  };

  return lookup[version_group_name];
};

exports.downloadFile = (fileUrl, outputLocationPath) => {
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
