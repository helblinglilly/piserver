const generalUtils = require("./general.utils");

export const weekdays = {
  short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export const daysBetweenTwoDates = (a: Date, b: Date): number => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

export const toUserFriendlyStringNoYearLocal = (date: Date): string => {
  const day: string = weekdays.short[date.getDay()];
  const dayDate: string = generalUtils.padWithLeadingCharacters(date.getDate(), 2, "0");
  const month: string = generalUtils.padWithLeadingCharacters(
    date.getMonth() + 1,
    2,
    "0",
  );

  return `${day}, ${dayDate}/${month}`;
};

export const todayISOUTC = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const addTime = (
  startTime: Date,
  addYears: number = 0,
  addMonths: number = 0,
  addDays: number = 0,
  addHours: number = 0,
  addMinutes: number = 0,
  addSeconds: number = 0,
): Date => {
  return new Date(
    startTime.getFullYear() + addYears,
    startTime.getMonth() + addMonths,
    startTime.getDate() + addDays,
    startTime.getHours() + addHours,
    startTime.getMinutes() + addMinutes,
    startTime.getSeconds() + addSeconds,
  );
};

export const isShortTime = (allegedTime: string): boolean => {
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(allegedTime);
};

export const dateToHHMMLocal = (date: Date): string => {
  const hours = date.toLocaleTimeString("en-GB").split(":")[0];
  const minutes = date.toLocaleTimeString("en-GB").split(":")[1];
  return `${hours}:${minutes}`;
};

export const dateToHHMMUTC = (date: Date): string => {
  const hours = date.toUTCString().split(" ")[4].split(":")[0];
  const minutes = date.toUTCString().split(" ")[4].split(":")[1];
  return `${hours}:${minutes}`;
};

export const constructUTCDateFromLocal = (date: Date, timeString?: string): Date => {
  const hour: number = timeString ? parseInt(timeString.split(":")[0]) : 0;
  const minute: number = timeString ? parseInt(timeString.split(":")[1]) : 0;

  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0),
  );
};

export const copyTimeObject = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
};
