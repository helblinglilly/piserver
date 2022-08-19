let manuallyUpdated = false;

document.addEventListener("DOMContentLoaded", () => {
  const lastEdit = new Date(document.getElementById("lastEdit").innerHTML);

  document.getElementById("lastEditDisplay").innerHTML = `Last Edit: ${lastEdit
    .toTimeString()
    .split(" ")[0]
    .substring(0, 5)}`;

  // Whenever we click a button, update
  const cards = document.getElementsByClassName("card");
  for (const card of cards) {
    card.addEventListener("click", () => {
      // We won't receive a payload from the server this way, so manually force the variables
      const nextAction = document.getElementById("nextAction").innerHTML;
      if (nextAction === "START") {
        document.getElementById("nextAction").innerHTML = "STOP";
        document.getElementById("nextActionText").innerHTML = "Pause";
        document.getElementById("lastEdit").innerHTML = new Date();
        document.getElementById("elapsed").innerHTML = new Date(0);
      } else if (nextAction === "CONT") {
        document.getElementById("nextAction").innerHTML = "STOP";
        document.getElementById("nextActionText").innerHTML = "Pause";
        document.getElementById("lastEdit").innerHTML = new Date();
        elapsed = document.getElementById("elapsed").innerHTML;
        document.getElementById("elapsed").innerHTML = elapsed;
      } else if (nextAction === "STOP") {
        document.getElementById("nextAction").innerHTML = "CONT";
        document.getElementById("nextActionText").innerHTML = "Continue";
        document.getElementById("lastEdit").innerHTML = new Date();
        document.getElementById("elapsed").innerHTML = new Date(0);
      }

      manuallyUpdated = true;
      update();
    });
  }

  update();
  setInterval(update, 1000 * 1); // * 10
  console.log("initalised");
});

const update = () => {
  const nextAction = document.getElementById("nextAction").innerHTML;
  console.log(nextAction);

  if (nextAction == "START") {
    const currentTotal = document.getElementById("total").innerHTML;
    const currentLastEdit = document.getElementById("lastEditDisplay").innerHTML;

    const notStartedTitle = "Not started";
    const notStartedSubtext = "Have a productive day :)";

    if (currentTotal !== notStartedTitle && !manuallyUpdated)
      document.getElementById("total").innerHTML = notStartedTitle;

    if (currentLastEdit != notStartedSubtext && !manuallyUpdated)
      document.getElementById("lastEditDisplay").innerHTML = notStartedSubtext;

    return;
  }

  const payloadTimestamp = new Date(
    document.getElementById("payloadTimestamp").innerHTML,
  );

  let elapsed = new Date(document.getElementById("elapsed").innerHTML);
  const now = new Date().toISOString();

  // If we are currently running, then we need to manually work out how much to add
  console.log(manuallyUpdated);
  if (
    (["STOP", "END"].includes(nextAction) && !manuallyUpdated) ||
    (nextAction === "CONT" && manuallyUpdated)
  ) {
    const extraMilliseconds = new Date(Date.parse(now)) - payloadTimestamp;
    const extraSeconds = Math.floor(extraMilliseconds / 1000) % 60;
    const extraMinutes = Math.floor(extraMilliseconds / 1000 / 60);
    const extraHours = Math.floor(extraMilliseconds / 1000 / 60 / 60);

    elapsed.setSeconds(elapsed.getSeconds() + extraSeconds);
    elapsed.setMinutes(elapsed.getMinutes() + extraMinutes);
    elapsed.setHours(elapsed.getHours() + extraHours);
  }

  elapsed = elapsed.toISOString();

  const hoursPassed = parseInt(elapsed.split("T")[1].split(":")[0]);
  const minutesPassed = parseInt(elapsed.split("T")[1].split(":")[1]);
  const secondsPassed = parseInt(elapsed.split("T")[1].split(":")[2].split(".")[0]);

  const hoursDisplay = hoursPassed > 0 ? hoursPassed + "h " : "";
  const minutesDisplay = minutesPassed > 0 ? minutesPassed + "min " : "";
  const secondsDisplay = secondsPassed + "sec";
  //const secondsDisplay = secondsPassed > 0 ? secondsPassed + "sec" : "";

  document.getElementById(
    "total",
  ).innerHTML = `${hoursDisplay}${minutesDisplay}${secondsDisplay}`;
};
