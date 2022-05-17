document.addEventListener("DOMContentLoaded", function () {
  let trigger = document.getElementsByClassName("trigger-button")[0];
  let dropdown = document.getElementsByClassName("dropdown")[0];

  trigger.addEventListener("click", (e) => {
    dropdown.classList.toggle("is-active");
  });
});
