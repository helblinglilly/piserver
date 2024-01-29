import {
	date,
	pgTable,
	primaryKey,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import PoolFactory from "./poolFactory";
import { and, eq, isNull } from "drizzle-orm";

export const Timesheet = pgTable(
	"timesheet",
	{
		username: varchar("username").notNull(),
		date: date("date", { mode: "string" }).notNull(),
		clockIn: timestamp("clock_in", { withTimezone: true }).notNull(),
		clockOut: timestamp("clock_out", { withTimezone: true }),
	},
	(table) => {
		return {
			pk: primaryKey(table.username, table.date),
		};
	},
);

export const TimesheetBreaks = pgTable(
	"timesheet_breaks",
	{
		username: varchar("username").notNull(),
		date: date("date", { mode: "string" }).notNull(),
		breakIn: timestamp("break_in", { withTimezone: true }).notNull(),
		breakOut: timestamp("break_out", { withTimezone: true }),
	},
	(table) => {
		return {
			pk: primaryKey(table.username, table.date, table.breakIn),
		};
	},
);

export interface IBreak {
	breakIn: Date;
	breakOut: Date | null;
}

/**
 * Returns a date that has stUTC[Hours|Minutes|Seconds|Milliseconds] applied to it. Meant to be used to get a consistent Date value out of a Date object
 * @param input
 * @returns Date
 */
const toMidnightUTC = (input: Date): Date => {
	const dateCopy = new Date(input);
	dateCopy.setUTCHours(0);
	dateCopy.setUTCMinutes(0);
	dateCopy.setUTCSeconds(0);
	dateCopy.setUTCMilliseconds(0);

	return dateCopy;
};

const db = PoolFactory();

export async function insertTimesheet(username: string, clockIn: Date) {
	const normalisedDay = toMidnightUTC(clockIn);

	await db
		.insert(Timesheet)
		.values({
			date: normalisedDay.toISOString(),
			username: username,
			clockIn: clockIn,
		})
		.onConflictDoNothing();
}

export async function setClockIn(username: string, day: Date, clockIn: Date) {
	const normalisedDay = toMidnightUTC(day);

	await db
		.update(Timesheet)
		.set({
			clockIn: clockIn,
		})
		.where(
			and(
				eq(Timesheet.username, username),
				eq(Timesheet.date, normalisedDay.toISOString()),
			),
		);
}

export async function setBreakIn(username: string, day: Date, breakIn: Date) {
	const normalisedDay = toMidnightUTC(day);

	await db
		.insert(TimesheetBreaks)
		.values({
			username: username,
			date: normalisedDay.toISOString(),
			breakIn: breakIn,
		})
		.onConflictDoUpdate({
			target: [
				TimesheetBreaks.username,
				TimesheetBreaks.date,
				TimesheetBreaks.breakIn,
			],
			set: { breakIn: breakIn },
			where: and(
				eq(TimesheetBreaks.username, username),
				eq(TimesheetBreaks.date, normalisedDay.toISOString()),
			),
		});
}

export async function insertBreakOut(
	username: string,
	day: Date,
	breakOut: Date,
) {
	const normalisedDay = toMidnightUTC(day);

	await db
		.update(TimesheetBreaks)
		.set({
			breakOut: breakOut,
		})
		.where(
			and(
				eq(TimesheetBreaks.username, username),
				eq(TimesheetBreaks.date, normalisedDay.toISOString()),
				isNull(TimesheetBreaks.breakOut),
			),
		);
}

export async function setClockOut(username: string, day: Date, clockOut: Date) {
	const normalisedDay = toMidnightUTC(day);

	await db
		.update(Timesheet)
		.set({
			clockOut: clockOut,
		})
		.where(
			and(
				eq(Timesheet.username, username),
				eq(Timesheet.date, normalisedDay.toISOString()),
			),
		);
}

export interface ITimesheet {
	clockIn: Date;
	clockOut: Date | null | undefined;
	breaks: {
		breakIn: Date;
		breakOut: Date | null;
	}[];
}

export async function getTimesheet(
	username: string,
	day: Date,
): Promise<ITimesheet | undefined> {
	const normalisedDay = toMidnightUTC(day);

	const timesheetQuery = db
		.select({ clockIn: Timesheet.clockIn, clockOut: Timesheet.clockOut })
		.from(Timesheet)
		.where(
			and(
				eq(Timesheet.username, username),
				eq(Timesheet.date, normalisedDay.toISOString()),
			),
		);
	const breakQuery = db
		.select({
			breakIn: TimesheetBreaks.breakIn,
			breakOut: TimesheetBreaks.breakOut,
		})
		.from(TimesheetBreaks)
		.where(
			and(
				eq(TimesheetBreaks.username, username),
				eq(TimesheetBreaks.date, normalisedDay.toISOString()),
			),
		);

	const [timesheet, breaks] = await Promise.all([timesheetQuery, breakQuery]);
	if (timesheet.length === 0) {
		return;
	}

	return {
		...timesheet[0],
		breaks: breaks.length > 0 ? breaks : [],
	};
}

export async function overrideTimesheet(
	username: string,
	day: Date,
	clockIn: Date,
	clockOut: Date | null | undefined,
) {
	const normalisedDay = toMidnightUTC(new Date(day));

	await db
		.insert(Timesheet)
		.values({
			username: username,
			date: normalisedDay.toISOString(),
			clockIn: clockIn,
			clockOut: clockOut,
		})
		.onConflictDoUpdate({
			target: [Timesheet.username, Timesheet.date],
			set: {
				clockIn: clockIn,
				clockOut: clockOut,
			},
		});
}

export async function overrideTimesheetBreaks(
	username: string,
	day: Date,
	breaks: {
		breakIn: Date;
		breakOut: Date | null;
	}[],
) {
	const normalisedDay = toMidnightUTC(day);

	await db
		.delete(TimesheetBreaks)
		.where(
			and(
				eq(TimesheetBreaks.username, username),
				eq(TimesheetBreaks.date, normalisedDay.toISOString()),
			),
		);

	await db.insert(TimesheetBreaks).values(
		breaks.map((entry) => {
			return {
				username: username,
				date: normalisedDay.toISOString(),
				breakIn: new Date(entry.breakIn),
				breakOut: entry.breakOut ? new Date(entry.breakOut) : undefined,
			};
		}),
	);
}
