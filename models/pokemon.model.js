const fs = require("fs");
const axios = require("axios");
const utils = require("../utils");

const cachePath = `${__dirname}/../cache/`;
const spriteCachePath = `${__dirname}/../public/assets/pokemon/cache/`;

let dictionaryData;

exports.receivePokemonItemData = (id) => {
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
  if (!fs.existsSync(`${cachePath}/item`)) fs.mkdirSync(`${cachePath}/item`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(cachePath + `item/${id}.json`)) {
      item = fs.readFileSync(cachePath + `item/${id}.json`, "utf-8");
      resolve(JSON.parse(item));
    } else {
      axios
        .get(`https://pokeapi.co/api/v2/item/${id}`)
        .then((response) => {
          console.log(`item/${id}`);
          fs.writeFileSync(
            cachePath + `item/${id}.json`,
            JSON.stringify(response.data),
            "utf-8",
          );
          resolve(response.data);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    }
  });
};
exports.receivePokemonData = (id) => {
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
  if (!fs.existsSync(`${cachePath}/pokemon`)) fs.mkdirSync(`${cachePath}/pokemon`);

  return new Promise((resolve, reject) => {
    if (id < 0 || id > 899) {
      reject("Pokemon out of range");
    } else {
      let item;

      if (fs.existsSync(cachePath + `pokemon/${id}.json`)) {
        item = fs.readFileSync(cachePath + `pokemon/${id}.json`, "utf-8");
        resolve(JSON.parse(item));
      } else {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then((response) => {
          console.log(`pokemon/${id}`);

          fs.writeFile(
            cachePath + `pokemon/${id}.json`,
            JSON.stringify(response.data),
            "utf-8",
          )
            .Promise()
            .then(() => {
              resolve(response.data);
            })
            .catch((err) => {
              reject(err);
            });
        });
      }
    }
  });
};

exports.receivePokemonSpeciesData = (id) => {
  if (!fs.existsSync(spriteCachePath)) fs.mkdirSync(spriteCachePath);
  if (!fs.existsSync(`${cachePath}/species`)) fs.mkdirSync(`${cachePath}/species`);

  return new Promise((resolve, reject) => {
    if (id < 0 || id > 899) {
      reject("Pokemon out of range");
    } else {
      let item;
      if (fs.existsSync(cachePath + `species/${id}.json`)) {
        item = fs.readFileSync(cachePath + `species/${id}.json`, "utf-8");
        resolve(JSON.parse(item));
      } else {
        axios
          .get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
          .then((response) => {
            fs.writeFileSync(
              cachePath + `species/${id}.json`,
              JSON.stringify(response.data),
              "utf-8",
            );
            resolve(response.data);
          })
          .catch((err) => {
            console.log(id, err);
          });
      }
    }
  });
};

exports.receivePokemonItemSprite = (item_name) => {
  if (!fs.existsSync(`${spriteCachePath}`)) fs.mkdirSync(`${spriteCachePath}`);
  if (!fs.existsSync(`${spriteCachePath}/item`)) fs.mkdirSync(`${spriteCachePath}item/`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${spriteCachePath}item/${item_name}.png`)) {
      resolve(`/static/assets/pokemon/cache/item/${item_name}.png`);
    } else {
      utils
        .downloadFile(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item_name}.png`,
          `${spriteCachePath}item/${item_name}.png`,
        )
        .then(() => {
          console.log(`sprites/item/${item_name}.png`);
          resolve(`/static/assets/pokemon/cache/item/${item_name}.png`);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    }
  });
};

exports.receivePokemonSprite = (id) => {
  if (!fs.existsSync(`${spriteCachePath}`)) fs.mkdirSync(`${spriteCachePath}`);
  if (!fs.existsSync(`${spriteCachePath}/pokemon`))
    fs.mkdirSync(`${spriteCachePath}/pokemon`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${spriteCachePath}pokemon/${id}.png`)) {
      resolve(`/static/assets/pokemon/cache/pokemon/${id}.png`);
    } else {
      utils
        .downloadFile(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          `${spriteCachePath}pokemon/${id}.png`,
        )
        .then(() => {
          resolve(`/static/assets/pokemon/cache/pokemon/${id}.png`);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    }
  });
};

exports.dictionaryData = () => {
  if (!dictionaryData) {
    dictionaryData = JSON.parse(fs.readFileSync("./pokedata/data.json", "utf-8"));
  }
  return dictionaryData;
};
