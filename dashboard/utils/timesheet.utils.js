exports.constructUTCDateTime = (day, time) => {
  if (day === null || time === null) return null;
  const parts = time.split(":");
  return new Date(
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), parts[0], parts[1], 0, 0),
  );
};

exports.copyDate = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    0,
    0,
  );
};

exports.timeWorked = (clock_in, break_in, break_out, clock_out) => {
  if (!break_in && !break_out && !clock_out) return null;
  if (!break_out && !clock_out) return break_in - clock_in;
  if (!clock_out) return break_in - clock_in + (new Date() - break_out);
  if (clock_out) return break_in - clock_in + (clock_out - break_out);
  return null;
};
