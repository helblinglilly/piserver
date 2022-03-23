const axios = require("axios");
const fs = require("fs");

const biggestId = 1658;

const pokenames = [];

const grab = async () => {
  for (let i = 0; i <= biggestId; i++) {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/item/${i}`);

      if (response.data.length < 4) {
        pokenames.push({ german: "unused", english: "unused", id: i });
        console.log(i, "unused");
      } else {
        const germanName = response.data.names[4].name;
        const englishName = response.data.name;
        pokenames.push({ german: germanName, english: englishName, id: i });
      }
    } catch (err) {
      pokenames.push({ german: "unused", english: "unused", id: i });
      console.log(i, "unused");
    }
    // console.log(response.data.names[4].name, response.data.name);

    console.log(i);
    await new Promise((r) => setTimeout(r, 200));
  }
  fs.writeFileSync("items.json", JSON.stringify(pokenames), "utf8");
};

grab();
