// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
	let { date, username } = req.query;
	if (!username) {
		username = "admin";
	}
	if (!date) {
		res.status(400).end();
		return;
	}
	console.log("Date", date);
	const cleanDate = new Date(date.toString());
	cleanDate.setUTCHours(0);
	cleanDate.setUTCMinutes(0);
	cleanDate.setUTCSeconds(0);
	cleanDate.setUTCMilliseconds(0);

	try {
		const timesheetData: any = await prisma.timesheet.findMany({
			where: {
				username: username,
				day_date: cleanDate,
			},
			include: {
				timesheet_breaks: true,
			},
		});

		res.status(200).json({ data: timesheetData });
	} catch (error) {
		console.log(error);
		res.status(500).end();
		return;
	}
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
	interface IPayload {
		action: "clockIn" | "breakIn" | "breakOut" | "clockOut";
		date: Date;
		time: Date;
	}
	let { action, date, time } = JSON.parse(req.body) as IPayload;
	date = new Date(date);
	date.setUTCHours(0);
	date.setUTCMinutes(0);
	date.setUTCSeconds(0);
	date.setUTCMilliseconds(0);
	try {
		if (action === "clockIn") {
			prisma.timesheet.create({
				data: {
					username: "admin",
					day_date: date,
					clock_in: time,
				},
			});
		} else if (action === "breakIn") {
			prisma.timesheet_breaks.create({
				data: {
					username: "admin",
					day_date: date,
					break_in: time,
				},
			});
		} else if (action === "breakOut") {
			prisma.timesheet_breaks.update({
				data: {
					break_out: time,
				},
				where: {
					username_day_date: {
						username: "admin",
						day_date: date,
					},
				},
			});
		} else if (action === "clockOut") {
			prisma.timesheet.update({
				data: {
					clock_out: time,
				},
				where: {
					username_day_date: {
						username: "admin",
						day_date: date,
					},
				},
			});
		}
	} catch (exception) {
		res.status(500).json({ error: "Failed to insert data" });
		return;
	}
	res.status(200).json({ action: action, date: date, time: time });
	return;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		await GET(req, res);
	} else if (req.method === "POST") {
		await POST(req, res);
	} else {
		res.status(405).end();
	}
}
