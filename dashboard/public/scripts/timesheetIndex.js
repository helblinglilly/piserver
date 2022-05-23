document.addEventListener("DOMContentLoaded", () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date(document.getElementById("day").innerHTML);
  const nextAction = document.getElementById("nextAction").innerHTML;
  const proposedEndTime = document.getElementById("proposedEndTime").innerHTML;
  const proposedBreakEndTime = document.getElementById("proposedBreakEndTime").innerHTML;
  document.getElementById("day").innerHTML = `${days[today.getDay()].substring(
    0,
    3,
  )} ${today.getDate()}/${today.getMonth()}`;

  if (nextAction === "Clock In") {
    document.getElementById("status").innerHTML = toTime(proposedEndTime);
  } else if (nextAction === "Break In") {
    document.getElementById("status").innerHTML = toTime(proposedEndTime);
  } else if (nextAction === "Break End") {
    document.getElementById("breakEnd").innerHTML = `Back: ${toTime(
      proposedBreakEndTime,
    )}`;
    document.getElementById("breakEnd").hidden = false;
    document.getElementById("status").innerHTML = `Done: ${toTime(proposedEndTime)}`;
  } else if (nextAction === "Clock Out") {
    const proposedEndTime = document.getElementById("proposedEndTime").innerHTML;
    const overtimeStatus = document.getElementById("overtimeStatus").innerHTML;
    const overtimeWorked = document.getElementById("overtimeWorked").innerHTML;

    if (overtimeStatus == false) {
      document.getElementById("status").innerHTML = toTime(proposedEndTime);
    } else {
      document.getElementById("breakEnd").hidden = false;
      document.getElementById("breakEnd").innerHTML = toTime(proposedEndTime);
      document.getElementById("status").innerHTML = overtimeWorked;
    }
  } else if (nextAction.includes("Done")) {
    const proposedEndTime = document.getElementById("proposedEndTime").innerHTML;
    const overtimeStatus = document.getElementById("overtimeStatus").innerHTML;
    const overtimeWorked = document.getElementById("overtimeWorked").innerHTML;

    if (overtimeStatus == false) {
      document.getElementById("status").innerHTML = toTime(proposedEndTime);
    } else {
      document.getElementById("breakEnd").hidden = false;
      document.getElementById("breakEnd").innerHTML = toTime(proposedEndTime);
      document.getElementById("status").innerHTML = overtimeWorked;
    }
  }
});

function toTime(date) {
  return new Date(date).toLocaleTimeString().substring(0, 5);
}
