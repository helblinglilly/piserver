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
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};
