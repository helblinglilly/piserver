document.addEventListener("DOMContentLoaded", function () {
  let cardToggles = document.getElementsByClassName("card-toggle");

  for (let i = 0; i < cardToggles.length; i++) {
    cardToggles[i].addEventListener("click", (e) => {
      e.currentTarget.parentNode.childNodes[1].classList.toggle("is-hidden");
    });
  }
});
