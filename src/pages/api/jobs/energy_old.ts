import Log from "@/log";
// import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

// const prisma = new PrismaClient();
const log = new Log("energy_usage");

type Data = {
	inserted: number;
};

/*
type EnergyData = {
	consumption: number;
	interval_start: Date;
	interval_end: Date;
};
*/

const baseURL = "https://api.octopus.energy/";


/*
const fetchElectricityData = async () => {
	return;
	const latestDBEntry = await latestElectricityEntry();

	let latestDate = latestDBEntry
		? latestDBEntry.end_date
		: process.env.MOVE_IN_DATE
		? new Date(process.env.MOVE_IN_DATE)
		: new Date(0);

	let fetchedAllData = false;
	const now = new Date();

	let rowCount = 0;

	while (!fetchedAllData) {
		const requestURL = `${baseURL}v1/electricity-meter-points/${
			process.env.OCTOPUS_ELECTRIC_MPAN
		}/meters/${
			process.env.OCTOPUS_ELECTRIC_SERIAL
		}/consumption?page_size=1000&period_from=${latestDate.toISOString()}&period_to=${now.toISOString()}&order_by=period`;

		const response = await octopusAuthedRequest(requestURL);

		if (!response) return;
		if (response.next === null) {
			fetchedAllData = true;
		}

		if (response.results.length === 0) {
			return;
		}

		latestDate = new Date(
			response.results[response.results.length - 1].interval_end
		);

		const payload = response.results.map((a: EnergyData) => {
			return {
				is_electric: true,
				is_gas: false,
				usage_kwh: a.consumption,
				start_date: new Date(a.interval_start),
				end_date: new Date(a.interval_end),
				entry_created: now.toISOString(),
			};
		});

		const insertCount = await prisma.energy_usage.createMany({
			data: [...payload],
			skipDuplicates: true,
		});
		rowCount += insertCount.count;
	}
	return rowCount;
};
*/

/*
const fetchGasData = async () => {
	return;
	const latestDBEntry = await latestGasEntry();

	let latestDate = latestDBEntry
		? latestDBEntry.end_date
		: process.env.MOVE_IN_DATE
		? new Date(process.env.MOVE_IN_DATE)
		: new Date(0);

	let fetchedAllData = false;
	const now = new Date();

	let rowCount = 0;

	while (!fetchedAllData) {
		const requestURL = `${baseURL}v1/gas-meter-points/${
			process.env.OCTOPUS_GAS_MPRN
		}/meters/${
			process.env.OCTOPUS_GAS_SERIAL
		}/consumption?page_size=1000&period_from=${latestDate.toISOString()}&period_to=${now.toISOString()}&order_by=period`;

		const response = await octopusAuthedRequest(requestURL);
		if (!response) return;
		if (!response.next) {
			fetchedAllData = true;
		}

		if (response.results.length === 0) {
			return;
		}
		latestDate = new Date(
			response.results[response.results.length - 1].interval_end
		);

		const payload = response.results.map((a: EnergyData) => {
			return {
				is_electric: false,
				is_gas: true,
				usage_kwh: a.consumption,
				start_date: new Date(a.interval_start),
				end_date: new Date(a.interval_end),
				entry_created: now,
			};
		});

		const insertCount = await prisma.energy_usage.createMany({
			data: [...payload],
			skipDuplicates: true,
		});
		rowCount += insertCount.count;
	}
	return rowCount;
};
*/

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	res.status(200).end();
	return;
	/*
	const [electricRows, gasRows] = await Promise.all([
		fetchElectricityData(),
		fetchGasData(),
	]);

	res.status(200).json({
		inserted: (electricRows ? electricRows : 0) + (gasRows ? gasRows : 0),
	});
	*/
}

export async function octopusAuthedRequest(requestURL: string) {
	const headers = new Headers();
	headers.set(
		"Authorization",
		`Basic ${Buffer.from(`${process.env.OCTOPUS_API_KEY}:${baseURL}`).toString(
			"base64"
		)}`
	);

	const response = await fetch(requestURL, {
		method: "GET",
		headers,
	});

	log.info(`${response.status} for ${requestURL}`);

	if (response.status === 200) {
		const body = await response.json();
		return body;
	} else {
		return;
	}
}
