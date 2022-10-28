import { WeekdayLong } from "../types/common.types";
import generalUtils from "./general.utils";

export class DateUtils {
  static weekdays = {
    short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  };

  static getWeekdayLong = (index: number): WeekdayLong => {
    switch (index) {
      case 0:
        return WeekdayLong.Sun;
      case 1:
        return WeekdayLong.Mon;
      case 2:
        return WeekdayLong.Tue;
      case 3:
        return WeekdayLong.Wed;
      case 4:
        return WeekdayLong.Thu;
      case 5:
        return WeekdayLong.Fri;
      case 6:
        return WeekdayLong.Sat;
      default:
        return WeekdayLong.Sun;
    }
  };

  static daysBetweenTwoDates = (a: Date, b: Date): number => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  };

  static toUserFriendlyStringNoYearLocal = (date: Date): string => {
    const day: string = this.weekdays.short[date.getDay()];
    const dayDate: string = generalUtils.padWithLeadingCharacters(date.getDate(), 2, "0");
    const month: string = generalUtils.padWithLeadingCharacters(
      date.getMonth() + 1,
      2,
      "0",
    );

    return `${day}, ${dayDate}/${month}`;
  };

  static todayISOUTC = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  static addTime = (
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

  static isShortTime = (allegedTime: string): boolean => {
    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(allegedTime);
  };

  static dateToHHMMLocal = (date: Date): string => {
    const hours = date.toLocaleTimeString("en-GB").split(":")[0];
    const minutes = date.toLocaleTimeString("en-GB").split(":")[1];
    return `${hours}:${minutes}`;
  };

  static dateToHHMMUTC = (date: Date): string => {
    const hours = date.toUTCString().split(" ")[4].split(":")[0];
    const minutes = date.toUTCString().split(" ")[4].split(":")[1];
    return `${hours}:${minutes}`;
  };

  static constructUTCDateFromLocal = (date: Date, timeString?: string): Date => {
    const hour: number = timeString ? parseInt(timeString.split(":")[0]) : 0;
    const minute: number = timeString ? parseInt(timeString.split(":")[1]) : 0;

    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0),
    );
  };

  static copyTimeObject = (date: Date): Date => {
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

  /**
   * Calls date.set[Hours|Minutes|Seconds] in a single function
   * @param date The date where the time should be modified
   * @param hours The number of hours that should be forced onto it
   * @param minutes The number of minutes that should be forced onto it
   * @param seconds The number of seconds that should be forced onto it
   */
  static setTime = (date: Date, hours: number, minutes: number, seconds: number) => {
    const returnedDate = this.copyTimeObject(date);
    returnedDate.setHours(hours);
    returnedDate.setMinutes(minutes);
    returnedDate.setSeconds(seconds);
    returnedDate.setMilliseconds(0);
    return returnedDate;
  };

  /**
   * When calling Date.setHours() it does so relative to the timezone of the date object
   * So if you have a UTC date and need to set the time as an absolute value, you need to use
   * Date.setUTCHours(). This function is a wrapper for multiple calls on that
   * @param date A Date object that has been initialised as UTC
   * @param hours The number of hours that should be forced onto it
   * @param minutes The number of minutes that should be forced onto it
   * @param seconds The number of seconds that should be forced onto it
   */
  static setUTCTime = (date: Date, hours: number, minutes: number, seconds: number) => {
    const returnedDate = this.copyTimeObject(date);
    returnedDate.setUTCHours(hours);
    returnedDate.setUTCMinutes(minutes);
    returnedDate.setUTCSeconds(seconds);
    returnedDate.setUTCMilliseconds(0);
    return returnedDate;
  };

  static toLocaleISOString = (date: Date) => {
    const years = date.getFullYear();
    const months = generalUtils.padWithLeadingCharacters(date.getMonth() + 1, 2, "0");
    const days = generalUtils.padWithLeadingCharacters(date.getDate(), 2, "0");
    const hours = generalUtils.padWithLeadingCharacters(date.getHours(), 2, "0");
    const minutes = generalUtils.padWithLeadingCharacters(date.getMinutes(), 2, "0");
    const seconds = generalUtils.padWithLeadingCharacters(date.getSeconds(), 2, "0");
    const milliseconds = generalUtils.padWithLeadingCharacters(
      date.getMilliseconds(),
      3,
      "0",
    );

    return `${years}-${months}-${days}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  };

  static yesterday = () => {
    return new Date(Date.now() - 86400000);
  };
}

export default DateUtils;
