import { IBreak, ITimesheet } from "@/db/Timesheet";

export const Weekdays = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export const Months = [
	{
		short: "Jan",
		long: "January",
	},
	{
		short: "Feb",
		long: "February",
	},
	{
		short: "Mar",
		long: "March",
	},
	{
		short: "Apr",
		long: "April",
	},
	{
		short: "May",
		long: "May",
	},
	{
		short: "Jun",
		long: "June",
	},
	{
		short: "Jul",
		long: "July",
	},
	{
		short: "Aug",
		long: "August",
	},
	{
		short: "Sep",
		long: "September",
	},
	{
		short: "Oct",
		long: "October",
	},
	{
		short: "Nov",
		long: "November",
	},
	{
		short: "Dec",
		long: "December",
	},
];

export const padLeft = (
	input: string | number,
	padChar: string,
	targetLength: number,
): string => {
	let inputCopy = input.toString();
	while (inputCopy.length < targetLength) {
		inputCopy = `${padChar}${inputCopy}`;
	}
	return inputCopy;
};

export const toDayHHMM = (date: Date): string => {
	return `${Weekdays[date.getDay()]}, ${padLeft(
		date.getHours(),
		"0",
		2,
	)}:${padLeft(date.getMinutes(), "0", 2)}`;
};

/**
 * Returns a day, date string at the current timezone
 * @param date
 * @returns Monday, 1 January
 */
export const toDayDDMM = (date: Date): string => {
	return `${Weekdays[date.getDay()]}, ${date.getDate()} ${Months[date.getMonth()].long
		}`;
};

/**
 * Returns the current hour and minutes of the provided date at the current timezone, padded to two digits
 * @param date
 * @returns HH:MM
 */
export const toHHMM = (date: Date): string => {
	return `${padLeft(date.getHours(), "0", 2)}:${padLeft(
		date.getMinutes(),
		"0",
		2,
	)}`;
};

/**
 * Returns the current hour and minutes of the provided date at UTC, padded to two digits
 * @param date
 * @returns HH:MM
 */
export const toHHMMUTC = (date: Date): string => {
	return `${padLeft(date.getUTCHours(), "0", 2)}:${padLeft(
		date.getUTCMinutes(),
		"0",
		2,
	)}`;
};

/**
 * Returns a date that has stUTC[Hours|Minutes|Seconds|Milliseconds] applied to it. Meant to be used to get a consistent Date value out of a Date object
 * @param date
 * @returns Date
 */
export const toMidnightUTC = (date: Date): Date => {
	const dateCopy = new Date(date);
	dateCopy.setUTCHours(0);
	dateCopy.setUTCMinutes(0);
	dateCopy.setUTCSeconds(0);
	dateCopy.setUTCMilliseconds(0);

	return dateCopy;
};

export const daysBetweenDates = (date1: Date, date2: Date): number => {
	const difference = Math.abs(date2.valueOf() - date1.valueOf());
	return Math.round(difference / (1000 * 60 * 60 * 24));
};

export const getPreviousMonday = (date: Date) => {
	const dayOfWeek = date.getDay();

	const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const previousMonday = new Date(date);
	previousMonday.setDate(date.getDate() - daysToSubtract);
	return previousMonday;
};

export const minutesBetweenDates = (a: Date, b: Date): number => {
	const diffInMs = Math.abs(b.getTime() - a.getTime());
	const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
	return diffInMinutes;
};

export const minutesWorkedInDay = (clockIn: Date | undefined | null, breaks: IBreak[] | undefined | null, clockOut: Date | undefined | null) => {
	if (clockIn === undefined || clockIn === null) return 0;

	let count = 0;
	let previousClockIn = clockIn;

	if (breaks && breaks.length > 0) {
		breaks.forEach((entry) => {
			count += minutesBetweenDates(previousClockIn, entry.breakIn);

			if (!entry.breakOut) {
				return count;
			}
			previousClockIn = entry.breakOut;
		});
	}

	if (!clockOut) return count + minutesBetweenDates(previousClockIn, new Date());

	count += minutesBetweenDates(clockOut, previousClockIn);

	return count;
}

export const addMinutesToDate = (date: Date, minutesToAdd: number) => {
	// Convert minutes to milliseconds
	const millisecondsToAdd = minutesToAdd * 60000;

	// Calculate the new timestamp
	const newTimestamp = date.getTime() + millisecondsToAdd;

	// Create a new Date object with the updated timestamp
	const newDate = new Date(newTimestamp);

	return newDate;
}

