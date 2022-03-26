const fs = require("fs");
const axios = require("axios");

const receivePokemonItem = async (id) => {
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
