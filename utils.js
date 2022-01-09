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
  return `${weekday()}, ${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;
};

exports.todayIso = () => {
  const date = new Date();
  return date.toISOString().substr(0, 10);
};

exports.addTime = (startTime, addTime) => {
  startTime.setHours(startTime.getHours() + addTime.hours);
  startTime.setMinutes(startTime.getMinutes() + addTime.minutes);
  return startTime;
};
