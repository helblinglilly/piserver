document.addEventListener("DOMContentLoaded", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const greenDate = document.getElementById("greenBinDate");
  if (greenDate.innerHTML === tomorrow.toLocaleDateString("en-GB")) {
    highlight(document.getElementById("greenBinCard"));
  }

  const blackDate = document.getElementById("blackBinDate");
  if (blackDate.innerHTML === tomorrow.toLocaleDateString("en-GB")) {
    highlight(document.getElementById("blackBinCard"));
  }

  const gasCard = document.getElementById("gasSummaryCard");
  gasCard.addEventListener("click", () => {
    const gasFooter = document.getElementById("gasFooter");
    gasFooter.classList.toggle("is-hidden");
  });

  const electricCard = document.getElementById("electricSummaryCard");
  electricCard.addEventListener("click", () => {
    const electricFooter = document.getElementById("electricFooter");
    electricFooter.classList.toggle("is-hidden");
  });
});

const highlight = (card) => {
  card.style.backgroundColor = "#fdf5b4";
  card.style.borderColor = "#eee6a9";
  card.style.borderWidth = "1px";
  card.style.borderStyle = "solid";
  card.classList.toggle("is-hidden-mobile");
};
