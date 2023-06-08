// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import TimesheetModel from "@/data/TimesheetData";

const dataInterface = new TimesheetModel();

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
	let { date, username } = req.query;
	if (!username) {
		username = "admin";
	}
	if (!date) {
		res.status(400).end();
		return;
	}

	try {
		const timesheetData = await dataInterface.getDailyData(
			new Date(date.toString()),
			"admin"
		);

		if (timesheetData.length === 0) {
			res.status(204).end();
			return;
		}
		res.status(200).json(timesheetData[0]);
	} catch (error) {
		console.error(error);
		res.status(500).end();
		return;
	}
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
	interface IPayload {
		action: "clockIn" | "breakIn" | "breakOut" | "clockOut";
		time: Date;
	}
	let { action, time } = JSON.parse(req.body) as IPayload;
	try {
		if (action === "clockIn") {
			await dataInterface.clockIn(time, "admin");
		} else if (action === "breakIn") {
			await dataInterface.breakIn(time, "admin");
		} else if (action === "breakOut") {
			await dataInterface.breakOut(time, "admin");
		} else if (action === "clockOut") {
			await dataInterface.clockOut(time, "admin");
		}
	} catch (exception) {
		console.error(exception);
		res.status(500).json({ error: "Failed to insert data" });
		return;
	}
	res.status(200).json({ action: action, time: time });
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
