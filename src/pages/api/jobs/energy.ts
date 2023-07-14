import {
	EnergyUsageRow,
	getLatestUsageEndDate,
	insertEnergyUsage,
} from "@/db/EnergyUsage";
import { NextApiRequest, NextApiResponse } from "next";

const OCTOPUS_BASE_URL = "https://api.octopus.energy/v1/";
const ELECTRIC_URL = `https://api.octopus.energy/v1/electricity-meter-points/${process.env.OCTOPUS_ELECTRIC_MPAN}/meters/${process.env.OCTOPUS_ELECTRIC_SERIAL}/consumption`;
const GAS_URL = `https://api.octopus.energy/v1/gas-meter-points/${process.env.OCTOPUS_GAS_MPRN}/meters/${process.env.OCTOPUS_GAS_SERIAL}/consumption`;

interface APIResponse {
	results: {
		consumption: number;
		interval_start: string;
		interval_end: string;
	}[];
	count: number;
	next: string;
	previous: string;
}

async function octopusAuthedRequest(requestURL: string) {
	const headers = new Headers();
	headers.set(
		"Authorization",
		`Basic ${Buffer.from(
			`${process.env.OCTOPUS_API_KEY}:${OCTOPUS_BASE_URL}`,
		).toString("base64")}`,
	);

	const response = await fetch(requestURL, {
		method: "GET",
		headers,
	});

	console.log(`${response.status} from ${requestURL}`);

	if (response.status === 200) {
		const body = await response.json();
		return body;
	} else {
		return response.status;
	}
}

const fetchEnergyData = async (
	kind: "electricity" | "gas",
	startDate: Date,
	endDate = new Date(),
) => {
	let requestURL = `${
		kind === "electricity" ? ELECTRIC_URL : GAS_URL
	}?page_size=1000&period_from=${startDate.toISOString()}&period_to=${endDate.toISOString()}&order_by=period`;

	let completed = false;
	let count = 0;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	while (!completed) {
		const response = (await octopusAuthedRequest(requestURL)) as
			| APIResponse
			| number;

		if (typeof response === "number" || response.count === 0) {
			completed = true;
			break;
		}

		const mapped = response.results.map((item): EnergyUsageRow => {
			return {
				energyType: kind,
				kWh: item.consumption,
				startDate: new Date(item.interval_start),
				endDate: new Date(item.interval_end),
			};
		});
		await insertEnergyUsage(mapped);
		count += response.count;

		if (!response.next) {
			completed = true;
			break;
		}
		requestURL = response.next;
	}
	return count;
};

const GET = async (res: NextApiResponse) => {
	const [latestElectricityDate, latesetGasDate] = await Promise.all([
		getLatestUsageEndDate("electricity"),
		getLatestUsageEndDate("gas"),
	]);

	const [electricRows, gasRows] = await Promise.all([
		fetchEnergyData("electricity", latestElectricityDate),
		fetchEnergyData("gas", latesetGasDate),
	]);

	if (electricRows === 0 && gasRows === 0) {
		res.status(204).end();
		return;
	}
	res.status(200).json({ electricRows: electricRows, gasRows: gasRows });
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const lookup = {
		GET: GET,
	};

	const result = lookup[req.method as "GET"];

	await result(res);
}
