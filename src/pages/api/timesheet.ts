// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
	getTimesheet,
	insertTimesheet,
	setBreakIn,
	insertBreakOut,
	setClockOut,
} from "@/db/Timesheet";
import type { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
	const username = req.query.username as string | undefined;
	const dateQuery = req.query.date as string | undefined;

	if (!username || !dateQuery) {
		res.status(400).json({ error: "Missing username or date" });
		return;
	}

	let date = new Date(0);
	try {
		date = new Date(dateQuery);
	} catch {
		res.status(400).json({ error: "Invalid date" });
		return;
	}

	try {
		const timesheet = await getTimesheet(username, date);
		if (!timesheet) {
			return res.status(204).end();
		}

		res.status(200).json(timesheet);
		return;
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
};

export interface IPostTimesheet {
	username: string;
	date: string;
	action: "clockIn" | "breakIn" | "breakOut" | "clockOut";
	time: string;
}
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
	let body: IPostTimesheet | undefined;

	try {
		body = JSON.parse(req.body) as IPostTimesheet;
	} catch {
		res.status(400).json({ error: "Invalid body" });
		return;
	}

	if (!body.username || !body.date || !body.time) {
		res.status(400).json({ error: "Invalid body" });
		return;
	}

	const existing = await getTimesheet(body.username, new Date(body.date));
	if (!existing && body.action !== "clockIn") {
		res.status(400).json({ error: "No entry exists yet - must clock in first" });
		return;
	} else if (!existing && body.action === "clockIn") {
		try {
			await insertTimesheet(body.username, new Date(body.date));
			res.status(200).end();
			return;
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	}

	switch (body.action) {
		case "breakIn":
			try {
				await setBreakIn(body.username, new Date(body.date), new Date(body.time));
				res.status(200).end();
				return;
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: "Internal server error" });
				return;
			}
		case "breakOut":
			try {
				await insertBreakOut(
					body.username,
					new Date(body.date),
					new Date(body.time),
				);
				res.status(200).end();
				return;
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: "Internal server error" });
				return;
			}
		case "clockOut":
			try {
				await setClockOut(body.username, new Date(body.date), new Date(body.time));
				res.status(200).end();
				return;
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: "Internal server error" });
				return;
			}
		default:
			res
				.status(400)
				.json({ error: "Entry for day already exists - can't clock in again" });
			return;
	}
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const lookup = {
		GET: GET,
		POST: POST,
	};

	const result = lookup[req.method as "GET"];

	await result(req, res);
}
