document.addEventListener("DOMContentLoaded", () => {
  const lastEdit = new Date(document.getElementById("lastEdit").innerHTML);
  document.getElementById("lastEditDisplay").innerHTML = `Last Edit: ${lastEdit
    .toTimeString()
    .split(" ")[0]
    .substring(0, 5)}`;
  update();
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
    document.getElementById(
      "total",
    ).innerHTML = `${elapsed.getHours()}h ${elapsed.getMinutes()}min`;
  } else if (nextAction === "CONT") {
    elapsed.setHours(elapsed.getHours());
    document.getElementById(
      "total",
    ).innerHTML = `${elapsed.getHours()}h ${elapsed.getMinutes()}min`;
  } else if (nextAction === "START") {
    document.getElementById("total").innerHTML = "Not started";
    document.getElementById("lastEditDisplay").innerHTML = "Have a productive time :)";
  }
};
