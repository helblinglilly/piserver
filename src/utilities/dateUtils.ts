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
	targetLength: number
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
		2
	)}:${padLeft(date.getMinutes(), "0", 2)}`;
};

/**
 * Returns a day, date string at the current timezone
 * @param date
 * @returns Monday, 1 January
 */
export const toDayDDMM = (date: Date): string => {
	return `${Weekdays[date.getDay()]}, ${date.getDate()} ${
		Months[date.getMonth()].long
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
		2
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
		2
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
	return Math.round((difference / (1000 * 60 * 60 * 24)));
}