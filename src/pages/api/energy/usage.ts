// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	res.status(200).end();
	return;
	/*
	if (req.method !== "GET") {
		res.status(405).end();
		return;
	}
	/*
		Default to:
		All entries between yesterday and now
	*/
	/*
	let fromDateParam = req.query["from"];
	let toDateParam = req.query["to"];
	let usageTypeParam = req.query["type"];

	const now = new Date();

	let toDate = now;

	const yesterday = now;
	yesterday.setDate(now.getDate() - 1);

	let fromDate = yesterday;
	let usageType = "both";

	if (fromDateParam && z.coerce.date().safeParse(fromDateParam)) {
		fromDate = new Date(fromDateParam.toString());
	}
	if (toDateParam && z.coerce.date().safeParse(toDateParam)) {
		toDate = new Date(toDateParam.toString());
	}
	if (fromDate !== now && toDate === now) {
		// Set toDate to + 1 day for safety
		let dayAfter = new Date(fromDate);
		dayAfter.setDate(dayAfter.getDate() + 1);
		toDate = dayAfter;
	}

	if (
		usageTypeParam &&
		(usageTypeParam.toString().toLowerCase() === "gas" ||
			usageTypeParam.toString().toLowerCase() === "electric")
	) {
		usageType = usageTypeParam.toString().toLowerCase();
	}

	const resultFn =
		usageType === "electric"
			? getElectricUsage
			: usageType === "gas"
			? getGasUsage
			: getEnergyUsage;

	const results = await resultFn(fromDate, toDate);
	if (results.length === 0) {
		res.status(204).end();
		return;
	}
	res.status(200).json(results);
	*/
}

/*
const getElectricUsage = async (
	from: Date,
	to: Date
): Promise<energy_usage[]> => {
	return await prisma.energy_usage.findMany({
		select: {
			is_electric: true,
			is_gas: true,
			usage_kwh: true,
			start_date: true,
			end_date: true,
			entry_created: true,
		},
		where: {
			AND: {
				is_electric: true,
				start_date: {
					gte: from,
				},
				end_date: {
					lte: to,
				},
			},
		},
		orderBy: {
			start_date: "asc",
		},
	});
};

const getGasUsage = async (from: Date, to: Date): Promise<energy_usage[]> => {
	return await prisma.energy_usage.findMany({
		select: {
			is_electric: true,
			is_gas: true,
			usage_kwh: true,
			start_date: true,
			end_date: true,
			entry_created: true,
		},
		where: {
			AND: {
				is_electric: false,
				start_date: {
					gte: from,
				},
				end_date: {
					lte: to,
				},
			},
		},
		orderBy: {
			start_date: "asc",
		},
	});
};

const getEnergyUsage = async (
	from: Date,
	to: Date
): Promise<energy_usage[]> => {
	return await prisma.energy_usage.findMany({
		select: {
			is_electric: true,
			is_gas: true,
			usage_kwh: true,
			start_date: true,
			end_date: true,
			entry_created: true,
		},
		where: {
			AND: {
				start_date: {
					gte: from,
				},
				end_date: {
					lte: to,
				},
			},
		},
		orderBy: {
			start_date: "asc",
		},
	});
};

*/
