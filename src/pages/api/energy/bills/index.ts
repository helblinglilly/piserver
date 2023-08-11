import {
	EnergyBillRow,
	getStandingChargeRates,
	insertEnergyBill,
	updateEnergyBill,
} from "@/db/EnergyBill";
import { daysBetweenDates } from "@/utilities/dateUtils";
import { validateBillInput } from "@/utilities/energyUtils";
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
			gas: EnergyBillRow;
			electricity: EnergyBillRow;
		};
	} catch {
		res.status(400).end();
		return;
	}

	const electricResult = validateBillInput({
		usage: body.electricity.usage,
		rate: body.electricity.usageRate,
		standingChargeRate: body.electricity.standingCharge,
		standingChargeDays: daysBetweenDates(
			new Date(body.electricity.startDate),
			new Date(body.electricity.endDate)
		),
		cost: body.electricity.cost,
		charged: body.electricity.charged,
	}
	);
	const gasResult = validateBillInput({
		usage: body.gas.usage,
		rate: body.gas.usageRate,
		standingChargeRate: body.gas.standingCharge,
		standingChargeDays: daysBetweenDates(
			new Date(body.gas.startDate),
			new Date(body.gas.endDate)
		),
		cost: body.gas.cost,
		charged: body.gas.charged,
	}
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
				gas: EnergyBillRow;
				electricity: EnergyBillRow;
			};
		};
	} catch {
		res.status(400).end();
		return;
	}

	const electricResult = validateBillInput(
		{
			usage: body.newBills.electricity.usage,
			rate: body.newBills.electricity.usageRate,
			standingChargeRate: body.newBills.electricity.standingCharge,
			standingChargeDays: daysBetweenDates(
				new Date(body.newBills.electricity.startDate),
				new Date(body.newBills.electricity.endDate)
			),
			cost: body.newBills.electricity.cost,
			charged: body.newBills.electricity.charged,
		}
	);
	const gasResult = validateBillInput(
		{
			usage: body.newBills.gas.usage,
			rate: body.newBills.gas.usageRate,
			standingChargeRate: body.newBills.gas.standingCharge,
			standingChargeDays: daysBetweenDates(
				new Date(body.newBills.gas.startDate),
				new Date(body.newBills.gas.endDate)
			),
			cost: body.newBills.gas.cost,
			charged: body.newBills.gas.charged,
		}
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
