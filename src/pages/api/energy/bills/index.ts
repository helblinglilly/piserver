
import { EnergyBillRow, insertEnergyBill } from "@/db/EnergyBill";
import { validateBillInputBE } from "@/utilities/energyUtils";
import { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
	res.status(200).end();
	return;
}

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
	let body;
	try {
		body = JSON.parse(req.body) as { gas: EnergyBillRow, electricity: EnergyBillRow };
	} catch {
		res.status(400).end();
		return;
	}

	const electricResult = validateBillInputBE(body.electricity.usage, body.electricity.usageRate, body.electricity.standingCharge, body.electricity.cost, body.electricity.charged);
	const gasResult = validateBillInputBE(body.gas.usage, body.gas.usageRate, body.gas.standingCharge, body.gas.cost, body.gas.charged);

	if (!electricResult.isValid || !gasResult.isValid){
		res.status(400).json({electricityErrors: electricResult.messages, gasErrors: gasResult.messages});
		return;
	}

	try {
		body.gas.startDate = new Date(body.gas.startDate);
		body.gas.endDate = new Date(body.gas.endDate);
		body.electricity.startDate = new Date(body.electricity.startDate);
		body.electricity.endDate = new Date(body.electricity.endDate);

		console.log(body.gas);
		await insertEnergyBill(body.gas, body.electricity);
		res.status(200).end();

	} catch(err){ 
		console.error(err);
		// console.log(body);
		res.status(500).end();
		return;
	}
}
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const lookup = {
		GET: GET,
		POST: POST,
	};

	const result = lookup[req.method as "GET" | "POST"];

	if (!result) {
		res.status(405).end();
		return;
	}

	await result(req, res);
}

