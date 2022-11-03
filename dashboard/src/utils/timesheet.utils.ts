export class TimesheetUtils {
  static timeWorked = (clock_in, break_in, break_out, clock_out) => {
    if (!break_in && !break_out && !clock_out) return null;
    if (!break_out && !clock_out) return break_in - clock_in;
    if (!clock_out) return break_in - clock_in + (new Date().valueOf() - break_out);
    if (clock_out) return break_in - clock_in + (clock_out - break_out);
    return null;
  };
}

export default TimesheetUtils;