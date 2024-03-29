import { IBreak } from "@/db/Timesheet";

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

/**
 * Pads a given character to the left of an input string to achieve a certain length
 * @param input The original input
 * @param padChar The character that should be used to pad up to the given length
 * @param targetLength The length to aim for
 * @returns
 */
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

/**
 * Returns the day, hour and minutes from a given date
 * @param date The date to parse
 * @returns `Wednesday, 13:42`
 */
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
 * @returns `Monday, 1 January`
 */
export const toDayDDMM = (date: Date): string => {
	return `${Weekdays[date.getDay()]}, ${date.getDate()} ${
		Months[date.getMonth()].long
	}`;
};

/**
 * Returns the current hour and minutes of the provided date at the current timezone, padded to two digits
 * @param date
 * @returns `13:42`
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
 * @returns `13:42`
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

export const previousWeek = (date: Date) => {
	const newDate = new Date(date);
	newDate.setDate(newDate.getDate() - 7);
	return newDate;
};

export const addWeek = (date: Date) => {
	const newDate = new Date(date);
	newDate.setDate(newDate.getDate() + 7);
	return newDate;
};

export const getClosestMonday = (date: Date): Date => {
	const dayOfWeek = date.getDay();

	if (dayOfWeek === 1) {
		// If it's already Monday, return the input date
		return date;
	} else {
		const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
		const closestMonday = new Date(date);
		closestMonday.setDate(date.getDate() - daysToSubtract);
		closestMonday.setHours(12);
		return closestMonday;
	}
};

export const addDays = (date: Date, days: number): Date => {
	const newDate = new Date(date);
	newDate.setDate(newDate.getDate() + days);
	return newDate;
};

export const minutesBetweenDates = (a: Date, b: Date): number => {
	const diffInMs = Math.abs(new Date(b).getTime() - new Date(a).getTime());
	const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
	return diffInMinutes;
};

export const minutesWorkedInDay = (
	clockIn: Date | undefined | null,
	breaks: IBreak[] | undefined | null,
	clockOut: Date | undefined | null,
) => {
	if (clockIn === undefined || clockIn === null) return 0;

	let count = 0;
	let previousClockIn = clockIn;
	let isCurrentlyOnBreak = false;

	if (breaks && breaks.length > 0) {
		breaks.forEach((entry) => {
			count += minutesBetweenDates(previousClockIn, new Date(entry.breakIn));

			if (!entry.breakOut) {
				isCurrentlyOnBreak = true;
				return count;
			}
			previousClockIn = new Date(entry.breakOut);
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!clockOut && !isCurrentlyOnBreak)
		return count + minutesBetweenDates(previousClockIn, new Date());
	else if (clockOut) {
		count += minutesBetweenDates(new Date(clockOut), previousClockIn);
	}
	return count;
};

export const addMinutesToDate = (date: Date, minutesToAdd: number) => {
	// Convert minutes to milliseconds
	const millisecondsToAdd = minutesToAdd * 60000;

	// Calculate the new timestamp
	const newTimestamp = date.getTime() + millisecondsToAdd;

	// Create a new Date object with the updated timestamp
	const newDate = new Date(newTimestamp);

	return newDate;
};
