import {
	EnergyBill,
	getStandingChargeRates,
	insertEnergyBill,
	updateEnergyBill,
} from "@/db/EnergyBill";
import { validateBillInputBE } from "@/utilities/energyUtils";
import { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
	const standingCharges = await getStandingChargeRates();
	res.status(200).json({
		standingCharges: [...standingCharges],
	});
	return;
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
	let body;
	try {
		body = JSON.parse(req.body) as {
			gas: EnergyBill;
			electricity: EnergyBill;
		};
	} catch {
		res.status(400).end();
		return;
	}

	const electricResult = validateBillInputBE(
		body.electricity.usage,
		body.electricity.usageRate,
		body.electricity.standingCharge,
		body.electricity.cost,
		body.electricity.charged,
	);
	const gasResult = validateBillInputBE(
		body.gas.usage,
		body.gas.usageRate,
		body.gas.standingCharge,
		body.gas.cost,
		body.gas.charged,
	);

	if (!electricResult.isValid || !gasResult.isValid) {
		res.status(400).json({
			electricityErrors: electricResult.messages,
			gasErrors: gasResult.messages,
		});
		return;
	}

	try {
		body.gas.startDate = new Date(body.gas.startDate);
		body.gas.endDate = new Date(body.gas.endDate);
		body.electricity.startDate = new Date(body.electricity.startDate);
		body.electricity.endDate = new Date(body.electricity.endDate);

		await insertEnergyBill(body.gas, body.electricity);
		res.status(200).end();
	} catch (err) {
		console.error(err);
		res.status(500).end();
		return;
	}
};

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
	let body;
	try {
		body = JSON.parse(req.body) as {
			originalBills: {
				startDate: string;
				endDate: string;
			};
			newBills: {
				gas: EnergyBill;
				electricity: EnergyBill;
			};
		};
	} catch {
		res.status(400).end();
		return;
	}

	const electricResult = validateBillInputBE(
		body.newBills.electricity.usage,
		body.newBills.electricity.usageRate,
		body.newBills.electricity.standingCharge,
		body.newBills.electricity.cost,
		body.newBills.electricity.charged,
	);
	const gasResult = validateBillInputBE(
		body.newBills.gas.usage,
		body.newBills.gas.usageRate,
		body.newBills.gas.standingCharge,
		body.newBills.gas.cost,
		body.newBills.gas.charged,
	);

	if (!electricResult.isValid || !gasResult.isValid) {
		res.status(400).json({
			electricityErrors: electricResult.messages,
			gasErrors: gasResult.messages,
		});
		return;
	}

	try {
		body.newBills.gas.startDate = new Date(body.newBills.gas.startDate);
		body.newBills.gas.endDate = new Date(body.newBills.gas.endDate);
		body.newBills.electricity.startDate = new Date(
			body.newBills.electricity.startDate,
		);
		body.newBills.electricity.endDate = new Date(
			body.newBills.electricity.endDate,
		);

		const updatedEntries = await updateEnergyBill(
			new Date(body.originalBills.startDate),
			new Date(body.originalBills.startDate),
			body.newBills,
		);

		if (!updatedEntries.electricity && !updatedEntries.gas) {
			res.status(204).end();
			return;
		}

		res.status(200).json(updatedEntries);
	} catch (err) {
		console.error(err);
		res.status(500).end();
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
		PATCH: PATCH,
	};

	const result = lookup[req.method as "GET" | "POST" | "PATCH"];

	await result(req, res);
}
