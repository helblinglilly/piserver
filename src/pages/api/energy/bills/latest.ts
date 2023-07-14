import { getLatestBillEndDate } from "@/db/EnergyBill";
import { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const result = await getLatestBillEndDate();
		res.status(200).json({ date: result});
	} catch(err) {
		console.error(err);
	}
  return;
}

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

