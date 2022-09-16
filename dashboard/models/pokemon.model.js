const fs = require("fs");
const axios = require("axios");
const utils = require("../utils");
const pokemonUtils = require("../utils/pokemon.utils");
const networkUtils = require("../utils/network.utils");

const cachePath = `${__dirname}/../cache/`;
let spriteCachePath = `${__dirname}/../public/assets/pokemon/cache/`;

let dictionaryData;

exports.receivePokemonItemData = (id) => {
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
  if (!fs.existsSync(`${cachePath}/item`)) fs.mkdirSync(`${cachePath}/item`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${cachePath}item/${id}.json`)) {
      const item = fs.readFileSync(`${cachePath}item/${id}.json`, "utf-8");
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

          fs.writeFileSync(
            cachePath + `pokemon/${id}.json`,
            JSON.stringify(response.data),
            "utf-8",
          );
          resolve(response.data);
        });
      }
    }
  });
};

exports.receivePokemonSpeciesData = (id) => {
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
  if (!fs.existsSync(`${cachePath}species`)) fs.mkdirSync(`${cachePath}species`);

  return new Promise((resolve, reject) => {
    if (id === null) {
      reject("ID was set to null");
      return;
    }
    if (id < 0 || id > 899 || !id) {
      reject("Pokemon out of range");
      return;
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
            reject(err);
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
      networkUtils
        .downloadFile(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item_name}.png`,
          `${spriteCachePath}item/${item_name}.png`,
        )
        .then(() => {
          console.log(`sprites/item/${item_name}.png`);
          resolve(`/static/assets/pokemon/cache/item/${item_name}.png`);
        })
        .catch((err) => {
          if (err.status === 404) {
            resolve(err.content);
          } else {
            console.log(err);
            reject(err);
          }
        });
    }
  });
};

exports.receivePokemonSpriteFront = (id) => {
  if (!fs.existsSync(`${spriteCachePath}`)) fs.mkdirSync(`${spriteCachePath}`);
  if (!fs.existsSync(`${spriteCachePath}/pokemon`))
    fs.mkdirSync(`${spriteCachePath}/pokemon`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${spriteCachePath}pokemon/${id}.png`)) {
      resolve(`/static/assets/pokemon/cache/pokemon/${id}.png`);
    } else {
      console.log(`sprite/${id}`);
      networkUtils
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

exports.receivePokemonSpriteShinyFront = (id) => {
  if (!fs.existsSync(`${spriteCachePath}`)) fs.mkdirSync(`${spriteCachePath}`);
  if (!fs.existsSync(`${spriteCachePath}/pokemon`))
    fs.mkdirSync(`${spriteCachePath}/pokemon`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${spriteCachePath}pokemon/${id}-shiny.png`)) {
      resolve(`/static/assets/pokemon/cache/pokemon/${id}-shiny.png`);
    } else {
      console.log(`sprite/${id}-shiny-front`);
      networkUtils
        .downloadFile(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
          `${spriteCachePath}pokemon/${id}-shiny.png`,
        )
        .then(() => {
          resolve(`/static/assets/pokemon/cache/pokemon/${id}-shiny.png`);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    }
  });
};

exports.receivePokemonSpriteBack = (id) => {
  if (!fs.existsSync(`${spriteCachePath}`)) fs.mkdirSync(`${spriteCachePath}`);
  if (!fs.existsSync(`${spriteCachePath}/pokemon`))
    fs.mkdirSync(`${spriteCachePath}/pokemon`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${spriteCachePath}pokemon/${id}-back.png`)) {
      resolve(`/static/assets/pokemon/cache/pokemon/${id}-back.png`);
    } else {
      console.log(`sprite/${id}-back`);
      networkUtils
        .downloadFile(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
          `${spriteCachePath}pokemon/${id}-back.png`,
        )
        .then(() => {
          resolve(`/static/assets/pokemon/cache/pokemon/${id}-back.png`);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    }
  });
};

exports.receivePokemonSpriteShinyBack = (id) => {
  if (!fs.existsSync(`${spriteCachePath}`)) fs.mkdirSync(`${spriteCachePath}`);
  if (!fs.existsSync(`${spriteCachePath}/pokemon`))
    fs.mkdirSync(`${spriteCachePath}/pokemon`);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(`${spriteCachePath}pokemon/${id}-shiny-back.png`)) {
      resolve(`/static/assets/pokemon/cache/pokemon/${id}-shiny-back.png`);
    } else {
      console.log(`sprite/${id}-shiny-back`);
      networkUtils
        .downloadFile(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${id}.png`,
          `${spriteCachePath}pokemon/${id}-shiny-back.png`,
        )
        .then(() => {
          resolve(`/static/assets/pokemon/cache/pokemon/${id}-shiny-back.png`);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    }
  });
};

// Read from cache/api
const getChain = (url) => {
  return new Promise((resolve, reject) => {
    const chainId = url.split("/")[url.split("/").length - 2];
    let chain;

    if (fs.existsSync(cachePath + `evolution/${chainId}.json`)) {
      chain = JSON.parse(
        fs.readFileSync(cachePath + `evolution/${chainId}.json`, "utf-8"),
      );
      resolve(chain);
    } else {
      console.log(`evolution/${chainId}`);
      axios
        .get(url)
        .then((response) => {
          chain = response.data.chain;

          fs.writeFileSync(
            cachePath + `evolution/${chainId}.json`,
            JSON.stringify(chain),
            "utf-8",
          );

          resolve(chain);
        })
        .then((err) => {
          console.log(err);
        });
    }
  });
};

const getEvolutionConditions = (detail) => {
  return new Promise(async (resolve) => {
    const conditions = [];

    if (detail === undefined) {
      resolve(conditions);
      return;
    }
    conditions.push({ trigger: detail.trigger.name });

    if (detail.gender) {
      conditions.push({ gender: detail.gender });
    }
    if (detail.held_item) {
      conditions.push({
        held_item: await this.receivePokemonItemSprite(detail.held_item.name),
        held_item_id:
          detail.held_item.url.split("/")[detail.held_item.url.split("/").length - 2],
      });
    }
    if (detail.item) {
      const itemId = detail.item.url.split("/")[detail.item.url.split("/").length - 2];
      const data = await this.receivePokemonItemData(itemId);
      const name = data.name;

      const sprite = await this.receivePokemonItemSprite(name);
      conditions.push({ item: itemId, itemSprite: sprite });
    }
    if (detail.known_move) {
      conditions.push({ move: detail.known_move });
    }
    if (detail.known_move_type) {
      conditions.push({ move_type: detail.known_move_type });
    }
    if (detail.location) {
      conditions.push({ location: detail.location });
    }
    if (detail.min_affection) {
      conditions.push({ affection: detail.min_affection });
    }
    if (detail.min_beauty) {
      conditions.push({ beauty: detail.min_beauty });
    }
    if (detail.min_happiness) {
      conditions.push({ happiness: detail.min_happiness });
    }
    if (detail.min_level) {
      conditions.push({ level: detail.min_level });
    }
    if (detail.needs_overworld_rain) {
      conditions.push({ raining: true });
    }
    if (detail.party_species) {
      console.log("Evolution trigger party species!");
      conditions.push({ pkmn_in_party: detail.party_species });
    }
    if (detail.party_type) {
      console.log("Evolution trigger party type!");
      conditions.push({ type_in_party: detail.party_type });
    }
    if (detail.time_of_day) {
      if (detail.time_of_day === "day") conditions.push({ time: "☀️" });
      else if (detail.time_of_day === "night") conditions.push({ time: "🌙" });
      else conditions.push({ time: detail.time_of_day });
    }
    if (detail.trade_species) {
      conditions.push({ trading_against: detail.trade_species });
    }
    resolve(conditions);
  });
};

const buildEvolutions = (chain) => {
  const results = [];
  return new Promise(async (resolve, reject) => {
    const species = chain.species.url.split("/")[chain.species.url.split("/").length - 2];
    const speciesSprite = await this.receivePokemonSpriteFront(species);
    const evolutions = [];

    if (chain.evolves_to.length === 0) {
      resolve([{ species: species, speciesSprite: speciesSprite, evolutions: [] }]);
      return;
    }
    chain.evolves_to.forEach(async (evolves, index) => {
      const targetId =
        evolves.species.url.split("/")[evolves.species.url.split("/").length - 2];
      const targetSprite = await this.receivePokemonSpriteFront(targetId);
      const conditions = await getEvolutionConditions(evolves.evolution_details[0]);

      evolutions.push({
        target: targetId,
        targetSprite: targetSprite,
        conditions: conditions,
      });

      results.push({
        species: species,
        speciesSprite: speciesSprite,
        evolutions: evolutions,
      });

      if (evolves.evolves_to.length > 0) {
        const level2Result = {};
        level2Result.evolutions = [];

        evolves.evolves_to.forEach(async (evol, index) => {
          level2Result.species = targetId;
          level2Result.speciesSprite = targetSprite;

          const level2TargetId =
            evol.species.url.split("/")[evol.species.url.split("/").length - 2];

          level2Result.evolutions.push({
            target: level2TargetId,
            targetSprite: await this.receivePokemonSpriteFront(level2TargetId),
            conditions: await getEvolutionConditions(evol.evolution_details[0]),
          });

          if (index === evolves.evolves_to.length - 1) {
            results.push(level2Result);
            resolve(results);
          }
        });
      } else {
        resolve(results);
      }
    });
  });
};

exports.receiveEvolutionChain = (url) => {
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
  if (!fs.existsSync(`${cachePath}evolution`)) fs.mkdirSync(`${cachePath}evolution`);

  return new Promise(async (resolve, reject) => {
    if (url === null) {
      reject("URL was not set");
      return;
    }

    const chainSource = await getChain(url);
    const results = await buildEvolutions(chainSource);
    // console.log(results);
    // export const getUniqueListBy = (arr, key1): any => {
    // return [...new Map(arr.map((item) => [item[key1], item])).values()];
    // };
    // const unique = utils.getUniqueListBy(results, "species", "target");

    resolve(results);
  });
};
exports.dictionaryData = () => {
  if (!dictionaryData) {
    dictionaryData = JSON.parse(fs.readFileSync("./pokedata/data.json", "utf-8"));
  }
  return dictionaryData;
};

exports.receiveTypeSprite = (name) => {
  const data = this.dictionaryData();

  for (const type of data.types) {
    if (type.english_id === name) return type.sprite;
  }
};

exports.receiveAttackData = (url) => {
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
  if (!fs.existsSync(`${cachePath}/attack`)) fs.mkdirSync(`${cachePath}/attack`);

  const id = url.split("/")[url.split("/").length - 2];

  return new Promise((resolve, reject) => {
    let attack;

    if (fs.existsSync(cachePath + `attack/${id}.json`)) {
      attack = fs.readFileSync(cachePath + `attack/${id}.json`, "utf-8");
      resolve(JSON.parse(attack));
    } else {
      axios.get(url).then((response) => {
        console.log(`attack/${id}`);

        fs.writeFileSync(
          cachePath + `attack/${id}.json`,
          JSON.stringify(response.data),
          "utf-8",
        );
        resolve(response.data);
      });
    }
  });
};

exports.receiveGamesPresent = (moves) => {
  let games = [];
  for (const pokemonMove of moves) {
    for (const version of pokemonMove.version_group_details) {
      const gameName = version.version_group.name;

      if (!games.some((entry) => entry.name === gameName)) {
        games.push({
          name: gameName,
          generation: pokemonUtils.generationLanguage(gameName).generation,
          details: pokemonUtils.generationLanguage(gameName),
        });
      }
    }
  }
  games = games.sort((a, b) =>
    pokemonUtils.compareObjectsOnAttribute(a, b, "generation"),
  );
  console.log(games);
  return games;
};
