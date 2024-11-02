import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openTimesheetDb() {
	return open({
		filename: "./timesheet.sqlite3",
		driver: sqlite3.Database,
	});
}

export async function openEnergyBillsDb() {
	return open({
		filename: "./energyBills.sqlite3",
		driver: sqlite3.Database,
	});
}

/**
 * Returns a date that has stUTC[Hours|Minutes|Seconds|Milliseconds] applied to it. Meant to be used to get a consistent Date value out of a Date object
 * @param input
 * @returns Date
 */
export const toMidnightUTC = (input: Date): Date => {
	const dateCopy = new Date(input);
	dateCopy.setUTCHours(0);
	dateCopy.setUTCMinutes(0);
	dateCopy.setUTCSeconds(0);
	dateCopy.setUTCMilliseconds(0);

	return dateCopy;
};
