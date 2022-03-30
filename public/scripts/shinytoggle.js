document.addEventListener("DOMContentLoaded", function () {
  let shinyToggle = document.getElementById("shiny-toggle");
  let front = document.getElementById("sprite-front");
  let back = document.getElementById("sprite-back");

  let isShiny = false;
  const basePath = "/static/assets/pokemon/cache/pokemon/";
  const id = front.src.split(basePath)[1].split(".")[0];

  shinyToggle.addEventListener("click", (e) => {
    if (isShiny === false) {
      front.src = `${basePath}${id}-shiny.png`;
      back.src = `${basePath}${id}-shiny-back.png`;
    } else {
      front.src = `${basePath}${id}.png`;
      back.src = `${basePath}${id}-back.png`;
    }
    isShiny = !isShiny;
    shinyToggle.classList.toggle("is-primary");
  });
  console.log(shinyToggle);
});
