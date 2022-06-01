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
  const overtimeStatus = document.getElementById("overtimeStatus").innerHTML;
  const overtimeWorked = document.getElementById("overtimeWorked").innerHTML;

  document.getElementById("day").innerHTML = `${days[today.getDay()].substring(
    0,
    3,
  )} ${today.getDate()}/${today.getMonth() + 1}`;

  if (nextAction === "Clock In") {
    document.getElementById("status").innerHTML = toTime(proposedEndTime);
  } else if (nextAction === "Break In") {
    if (overtimeStatus === "true") {
      document.getElementById("status").innerHTML = overtimeWorked;
      document.getElementById("breakEnd").innerHTML = toTime(proposedEndTime);
      document.getElementById("breakEnd").hidden = false;
    } else {
      document.getElementById("status").innerHTML = toTime(proposedEndTime);
    }
  } else if (nextAction === "Break End") {
    document.getElementById("breakEnd").innerHTML = `Back: ${toTime(
      proposedBreakEndTime,
    )}`;

    if (overtimeStatus === "true")
      document.getElementById("status").innerHTML = overtimeWorked;
    else document.getElementById("status").innerHTML = `Done: ${toTime(proposedEndTime)}`;
    document.getElementById("breakEnd").hidden = false;
  } else if (nextAction === "Clock Out") {
    if (overtimeStatus === "true") {
      document.getElementById("status").innerHTML = overtimeWorked;
      document.getElementById("breakEnd").innerHTML = toTime(proposedEndTime);
      document.getElementById("breakEnd").hidden = false;
    } else {
      document.getElementById("status").innerHTML = toTime(proposedEndTime);
    }
  } else if (nextAction.includes("Done")) {
    document.getElementById("status").innerHTML = overtimeWorked;
    document.getElementById("breakEnd").innerHTML = toTime(proposedEndTime);
    document.getElementById("breakEnd").hidden = false;
  }
});

function toTime(date) {
  return new Date(date).toLocaleTimeString().substring(0, 5);
}
