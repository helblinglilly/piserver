const fs = require("fs");
const axios = require("axios");
const utils = require("../utils");

const cachePath = `${__dirname}/`;
const spriteCachePath = `${__dirname}/../public/assets/pokemon/cache/`;

if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
if (!fs.existsSync(spriteCachePath)) fs.mkdirSync(spriteCachePath);

exports.receivePokemonItemData = async (id) => {
  if (!fs.existsSync(`${cachePath}/item`)) fs.mkdirSync(`${cachePath}/item`);

  let item;
  if (fs.existsSync(cachePath + `item/${id}.json`)) {
    item = fs.readFileSync(cachePath + `item/${id}.json`, "utf-8");
    item = JSON.parse(item);
    // console.log(`Read item ${id} from cache`);
  } else {
    const itemResponse = await axios.get(`https://pokeapi.co/api/v2/item/${id}`);
    item = itemResponse.data;
    fs.writeFileSync(cachePath + `item/${id}.json`, JSON.stringify(item));
    console.log(`item/${id}`);
  }
  return item;
};

exports.receivePokemonData = async (id) => {
  if (!fs.existsSync(`${cachePath}/pokemon`)) fs.mkdirSync(`${cachePath}/pokemon`);

  let item;
  if (fs.existsSync(cachePath + `pokemon/${id}.json`)) {
    item = fs.readFileSync(cachePath + `pokemon/${id}.json`, "utf-8");
    item = JSON.parse(item);
    // console.log(`Read Pokemon ${id} from cache`);
  } else {
    const itemResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    item = itemResponse.data;
    fs.writeFileSync(cachePath + `pokemon/${id}.json`, JSON.stringify(item));
    console.log(`pokemon/${id}`);
  }
  return item;
};

exports.receivePokemonSpeciesData = async (id) => {
  if (id > 0 && id < 899) {
    if (!fs.existsSync(`${cachePath}/species`)) fs.mkdirSync(`${cachePath}/species`);

    let item;
    if (fs.existsSync(cachePath + `species/${id}.json`)) {
      item = fs.readFileSync(cachePath + `species/${id}.json`, "utf-8");
      item = JSON.parse(item);
      // console.log(`Read Species ${id} from cache`);
    } else {
      const itemResponse = await axios.get(
        `https://pokeapi.co/api/v2/pokemon-species/${id}`,
      );
      item = itemResponse.data;
      fs.writeFileSync(cachePath + `species/${id}.json`, JSON.stringify(item));
      console.log(`pokemon-species/${id}`);
    }
    return item;
  }
};

exports.receivePokemonItemSprite = async (item_name) => {
  if (!fs.existsSync(`${spriteCachePath}/item`)) fs.mkdirSync(`${spriteCachePath}/item`);

  if (!fs.existsSync(spriteCachePath + `item/${item_name}.png`)) {
    console.log(`sprites/item/${item_name}.png`);
    await utils.downloadFile(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item_name}.png`,
      `${spriteCachePath}item/${item_name}.png`,
    );
  }
  return `/static/assets/pokemon/cache/item/${item_name}.png`;
};

exports.receivePokemonSprite = async (id) => {
  if (!fs.existsSync(`${spriteCachePath}/pokemon`))
    fs.mkdirSync(`${spriteCachePath}/pokemon`);

  console.log(id);
  if (!fs.existsSync(spriteCachePath + `pokemon/${id}.png`)) {
    console.log(`sprites/pokemon/${id}.png`);
    await utils.downloadFile(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      `${spriteCachePath}pokemon/${id}.png`,
    );
  }
  return `/static/assets/pokemon/cache/pokemon/${id}.png`;
};
