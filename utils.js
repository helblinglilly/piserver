weekday = () => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[new Date().getDay()];
};

exports.today = () => {
  const date = new Date();
  return `${weekday()}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

exports.todayIso = () => {
  const date = new Date();
  return date.toISOString().substr(0, 10);
};

exports.addTime = (startTime, addTime = { hours: 0, minutes: 0 }) => {
  if (!startTime || !addTime) throw "Invalid Argument - empty";
  else if (typeof startTime !== "object")
    throw "Invalid Argument - startTime is not DateTime";
  else if (typeof addTime !== "object")
    throw "Invalid Argument - addTime is not an object";

  startTime.setHours(startTime.getHours() + addTime.hours);
  startTime.setMinutes(startTime.getMinutes() + addTime.minutes);
  return startTime;
};

exports.dateTimeToTime = (date) => {
  if (date === undefined) throw "Invalid Argument - empty";
  else if (typeof date !== "object") throw "Invalid Argument - Not an object";
  let hours = date.getHours();
  let minutes = date.getMinutes();

  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;

  return `${hours}:${minutes}`;
};

exports.constructDateTime = (day, time) => {
  if (day === undefined || time === undefined) throw "Invalid Argument - empty";
  else if (typeof day !== "object") throw "Invalid Argument - Not an object";
  else if (typeof time !== "string") throw "Invalid Argument - Not a string";

  const dateTime = new Date(day);
  dateTime.setHours(time.substr(0, 2));
  dateTime.setMinutes(time.substr(3, 2));
  return dateTime;
};
