exports.buildDateWithTime = (day_date, hhmm) => {
  const date = new Date(
    day_date.getFullYear(),
    day_date.getMonth(),
    day_date.getDate(),
    hhmm.split(":")[0],
    hhmm.split(":")[1],
  );
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date;
};

exports.buildBaseDate = (day_date) => {
  return new Date(day_date.getFullYear(), day_date.getMonth(), day_date.getDate());
};
