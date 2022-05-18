document.addEventListener("DOMContentLoaded", () => {
  update();
  const lastEdit = new Date(document.getElementById("lastEdit").innerHTML);
  document.getElementById("lastEditDisplay").innerHTML = `Last Edit: ${lastEdit
    .toTimeString()
    .split(" ")[0]
    .substring(0, 5)}`;
  setInterval(update, 1000 * 10);
});

const update = () => {
  const nextAction = document.getElementById("nextAction").innerHTML;
  const lastEdit = new Date(document.getElementById("lastEdit").innerHTML);
  const elapsed = new Date(document.getElementById("elapsed").innerHTML);
  const now = new Date();

  if (["STOP", "END"].includes(nextAction)) {
    const extraHours = now.getHours() - lastEdit.getHours();
    const extraMinutes = now.getMinutes() - lastEdit.getMinutes();
    const extraSeconds = now.getSeconds() - lastEdit.getSeconds();

    elapsed.setHours(elapsed.getHours() + extraHours);
    elapsed.setMinutes(elapsed.getMinutes() + extraMinutes);
    elapsed.setSeconds(elapsed.getSeconds() + extraSeconds);
  } else {
    elapsed.setHours(elapsed.getHours() + 1);
  }
  document.getElementById(
    "total",
  ).innerHTML = `${elapsed.getHours()}h ${elapsed.getMinutes()}min`;
};
