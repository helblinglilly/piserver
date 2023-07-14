// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getEnergyUsage } from "@/db/EnergyUsage";
import type { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
	const now = new Date();
	const defaultToDate = new Date(now);
	const defaultFromDate = new Date(now.setDate(now.getDate() - 1));

	let fromDate = defaultFromDate;
	let toDate = defaultToDate;
	let usageType: "all" | "electricity" | "gas" = "all";

	try {
		fromDate = req.query["from"]
			? new Date(req.query["from"].toString())
			: defaultFromDate;

		toDate = req.query["to"]
			? new Date(req.query["to"].toString())
			: defaultToDate;

		const usageTypeParam = req.query["type"];
		if (
			usageTypeParam &&
			["electricity", "gas", "all"].includes(usageTypeParam.toString())
		) {
			usageType = usageTypeParam.toString() as "all" | "electricity" | "gas";
		}
	} catch (e) {
		res.status(400).end({ error: "Invalid query parameters" });
		return;
	}

	try {
		const adjustForTimezone = (date: Date) => {
			var timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
			date.setTime(date.getTime() + timeOffsetInMS);
			return date;
		};

		const results = await getEnergyUsage(
			usageType,
			adjustForTimezone(fromDate),
			adjustForTimezone(toDate)
		);
		if (results.length === 0) {
			res.status(204).end();
			return;
		}

		res.status(200).json(results);
		return;
	} catch (error) {
		console.error(error);
		res.status(500).end();
		return;
	}
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const lookup = {
		GET: GET,
	};

	const result = lookup[req.method as "GET"];

	if (!result) {
		res.status(405).end();
		return;
	}

	await result(req, res);
}
