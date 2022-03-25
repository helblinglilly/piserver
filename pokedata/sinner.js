const axios = require("axios");
const fs = require("fs");

const biggestId = 267;

const pokenames = [];

const grab = async () => {
  for (let i = 1; i <= biggestId; i++) {
    const response = await axios.get(`https://pokeapi.co/api/v2/ability/${i}`);

    if (response.data.length < 4) {
      pokenames.push({
        german: "unused",
        english: "unused",
        english_id: "unused",
        id: i,
      });
      console.log(i, "unused");
    } else {
      const germanName = response.data.names[4].name;
      const englishName = response.data.names[7].name;
      const englishId = response.data.name;

      pokenames.push({
        german: germanName,
        english: englishName,
        english_id: englishId,
        id: i,
      });
    }

    console.log(i);
    await new Promise((r) => setTimeout(r, 200));
  }
  fs.writeFileSync("ability.json", JSON.stringify(pokenames), "utf8");
};

grab();
