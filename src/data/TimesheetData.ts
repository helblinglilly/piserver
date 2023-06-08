import { toMidnightUTC } from "@/utilities/dateUtils";
import { PrismaClient } from "@prisma/client";

export default class TimesheetModel {
	private prisma;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async clockIn(time: Date, username: string) {
		const date = toMidnightUTC(time);

		await this.prisma.timesheet.create({
			data: {
				username: username,
				day_date: date,
				clock_in: time,
			},
		});
	}

	private async getTimesheetId(
		date: Date,
		username: string
	): Promise<number | undefined> {
		const result = await this.prisma.timesheet.findFirst({
			select: {
				id: true,
			},
			where: {
				username: username,
				day_date: date,
			},
		});

		return result?.id;
	}

	async breakIn(time: Date, username: string) {
		const date = toMidnightUTC(time);

		const timesheetId = await this.getTimesheetId(date, username);

		if (!timesheetId) {
			throw new Error(
				"When trying to create a break_in entry, a matching clock_in entry could not be found"
			);
		}

		await this.prisma.timesheet_breaks.create({
			data: {
				break_in: time,
				timesheet: { connect: { id: timesheetId } },
			},
		});
	}

	private getExistingBreakEntry = async (date: Date, username: string) => {
		const timesheetId = await this.getTimesheetId(date, username);

		if (!timesheetId) {
			throw new Error(
				"When trying to fetch an existing break entry, a matching clock_in entry could not be found"
			);
		}

		const existingTimesheetBreak = await this.prisma.timesheet_breaks.findFirst(
			{
				where: {
					break_out: null, // Only select entries where break_out is null (not yet populated)
					timesheet: { id: timesheetId },
				},
				include: {
					timesheet: true, // Include the associated timesheet in the query result
				},
			}
		);

		if (!existingTimesheetBreak) {
			throw new Error(
				"Timesheet break not found for the given timesheetId and break_in"
			);
		}

		return existingTimesheetBreak.id;
	};

	async breakOut(time: Date, username: string) {
		const date = toMidnightUTC(time);

		const timesheetId = await this.getTimesheetId(date, username);
		if (!timesheetId) {
			throw new Error(
				"When trying to create a break_in entry, a matching clock_in entry could not be found"
			);
		}

		const breakTimesheetId = await this.getExistingBreakEntry(date, username);

		await this.prisma.timesheet_breaks.update({
			where: {
				id: breakTimesheetId,
			},
			data: {
				break_out: time,
			},
		});
	}

	async clockOut(time: Date, username: string) {
		const date = toMidnightUTC(time);

		const timesheetId = await this.getTimesheetId(date, username);
		if (!timesheetId) {
			throw new Error(
				"When trying to create a break_in entry, a matching clock_in entry could not be found"
			);
		}

		await this.prisma.timesheet.update({
			where: {
				id: timesheetId,
			},
			data: {
				clock_out: time,
			},
		});
	}

	async getDailyData(day: Date, username: string): Promise<ITimesheetDay[]> {
		const date = toMidnightUTC(day);

		const content = await this.prisma.timesheet.findMany({
			where: {
				username: username,
				day_date: date,
			},
			select: {
				day_date: true,
				clock_in: true,
				clock_out: true,
				timesheet_breaks: {
					select: {
						break_in: true,
						break_out: true,
					},
					orderBy: {
						break_in: "asc",
					},
				},
			},
		});

		return content;
	}
}

export interface ITimesheetDay {
	day_date: Date;
	clock_in: Date;
	clock_out: Date | null;
	timesheet_breaks: {
		break_in: Date;
		break_out: Date | null;
	}[];
}
