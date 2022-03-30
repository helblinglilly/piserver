const axios = require("axios");
const fs = require("fs");

const biggestId = 898;

const pokenames = [];

const grab = async () => {
  for (let i = 650; i <= biggestId; i++) {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`);

    let german, english;
    response.data.names.forEach((entry) => {
      if (entry.language.name === "de") {
        german = entry.name;
      }
      if (entry.language.name === "en") {
        english = entry.name;
      }
    });

    pokenames.push({ german: german, english: english, id: i });
    // console.log(german);

    console.log(i);
  }
  await new Promise((r) => setTimeout(r, 200));

  fs.writeFileSync("ability.json", JSON.stringify(pokenames), "utf8");
};

grab();
