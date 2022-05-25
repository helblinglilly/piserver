exports.buildDateWithTime = (day_date, hhmm) => {
  return new Date(
    day_date.getFullYear(),
    day_date.getMonth(),
    day_date.getDate(),
    hhmm.split(":")[0],
    hhmm.split(":")[1],
  );
};

exports.buildBaseDate = (day_date) => {
  return new Date(day_date.getFullYear(), day_date.getMonth(), day_date.getDate());
};
