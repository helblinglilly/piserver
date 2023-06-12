// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
import { PrismaClient, energy_bill } from "@prisma/client";
import {
	Decimal,
	PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		let startDateParam = req.query["startDate"];
		let startDate = new Date(0);

		let endDateParam = req.query["endDate"];
		let endDate = new Date();

		let limitParam = req.query["limit"];
		let limit = Number.MAX_SAFE_INTEGER;

		let billType = req.query["type"];

		if (billType !== "gas" && billType !== "electric") billType = "all";

		if (startDateParam && z.coerce.date().safeParse(startDateParam)) {
			startDate = new Date(startDateParam.toString());
		}

		if (
			endDateParam &&
			z.coerce.date().max(new Date()).safeParse(endDateParam)
		) {
			endDate = new Date(endDateParam.toString());
		}

		if (limitParam && typeof limit === "number" && limit > 0) {
			limit = Number(limitParam);
		}

		try {
			let results: energy_bill[] = [];

			if (billType === "gas") {
				results = await retrieveGasBill(
					billType as "gas" | "electric" | "all",
					startDate,
					endDate,
					limit
				);
			} else if (billType === "electric") {
				results = await retrieveElectricBill(
					billType as "gas" | "electric" | "all",
					startDate,
					endDate,
					limit
				);
			} else {
				results = await retrieveAnyBill(
					billType as "gas" | "electric" | "all",
					startDate,
					endDate,
					limit
				);
			}

			if (results.length === 0) {
				res.status(204).end();
				return;
			}
			results = results.map((a) => {
				return {
					billing_start: a.billing_start,
					billing_end: a.billing_end,
					is_electric: a.is_electric,
					is_gas: a.is_gas,
					usage_kwh: new Decimal(Number(a.usage_kwh).toFixed(2)),
					rate_kwh: new Decimal(Number(a.rate_kwh).toFixed(2)),
					standing_order_rate: new Decimal(
						Number(a.standing_order_rate).toFixed(2)
					),
					standing_order_charge_days: a.standing_order_charge_days,
					pre_tax: new Decimal(Number(a.pre_tax).toFixed(2)),
					after_tax: new Decimal(Number(a.after_tax).toFixed(2)),
				};
			});
			res.status(200).json(results);
		} catch (err) {
			console.log(err);
			res.status(500).end();
		}
	} else if (req.method === "POST") {
		try {
			EnergyBillPayloadSchema.parse(req.body);
		} catch (validationError) {
			if (validationError instanceof ZodError) {
				const errorMessages = validationError.issues.map((i) => i.message);
				res.status(400).json({ errors: errorMessages });
				return;
			}
			res.status(400).json({ message: validationError });
			return;
		}

		return insertBill(req.body)
			.then((result) => {
				res.status(201).json(result);
			})
			.catch((err: PrismaClientKnownRequestError) => {
				if (err.code === "P2002") {
					res.status(409).json({
						message:
							"A bill with the same type, and start/end date already exists",
					});
				} else {
					console.log(err);
					res.status(500).end();
				}
			});
	} else if (req.method === "PUT") {
		try {
			EnergyBillPayloadSchema.parse(req.body);
		} catch (validationError) {
			if (validationError instanceof ZodError) {
				const errorMessages = validationError.issues.map((i) => i.message);
				res.status(400).json({ errors: errorMessages });
				return;
			}
			res.status(400).json({ message: validationError });
			return;
		}

		return updateBill(req.body)
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err: PrismaClientKnownRequestError) => {
				if (err.code === "P2025") {
					res.status(404).end();
				} else {
					console.log(err.code);
					res.status(500).end();
				}
			});
	} else {
		return res.status(405).end();
	}
}

const insertBill = async (data: EnergyBillPayload) => {
	const preTax =
		(data.standingChargeDays + Number(data.kwhUsage) * Number(data.kwhRate)) /
		100;
	return await prisma.energy_bill.create({
		data: {
			is_electric: data.billType === "electric" ? true : false,
			is_gas: data.billType === "gas" ? true : false,
			billing_start: new Date(data.startDate),
			billing_end: new Date(data.endDate),
			standing_order_charge_days: data.standingChargeDays,
			standing_order_rate: data.standingChargeRate,
			usage_kwh: data.kwhUsage,
			rate_kwh: data.kwhRate,
			pre_tax: preTax,
			after_tax: preTax * 1.05,
		},
	});
};

const retrieveAnyBill = async (
	billType: "gas" | "electric" | "all",
	startDate: Date,
	endDate: Date,
	limit: number
): Promise<energy_bill[]> => {
	if (limit === 1) {
		const gasPromise = prisma.energy_bill.findFirst({
			take: limit,
			select: {
				billing_start: true,
				billing_end: true,
				is_electric: billType === "all",
				is_gas: billType === "all",
				usage_kwh: true,
				rate_kwh: true,
				standing_order_rate: true,
				standing_order_charge_days: true,
				pre_tax: true,
				after_tax: true,
			},
			where: {
				AND: {
					is_gas: true,
					billing_start: {
						gte: startDate,
					},
					billing_end: {
						lte: endDate,
					},
				},
			},
			orderBy: {
				billing_start: "desc",
			},
		});

		const electricPromise = prisma.energy_bill.findFirst({
			take: limit,
			select: {
				billing_start: true,
				billing_end: true,
				is_electric: billType === "all",
				is_gas: billType === "all",
				usage_kwh: true,
				rate_kwh: true,
				standing_order_rate: true,
				standing_order_charge_days: true,
				pre_tax: true,
				after_tax: true,
			},
			where: {
				AND: {
					is_gas: false,
					billing_start: {
						gte: startDate,
					},
					billing_end: {
						lte: endDate,
					},
				},
			},
			orderBy: {
				billing_start: "desc",
			},
		});

		const [gas, electric] = await Promise.all([gasPromise, electricPromise]);
		const result: energy_bill[] = [];

		if (gas) result.push(gas);
		if (electric) result.push(electric);
		return result;
	}
	return await prisma.energy_bill.findMany({
		take: limit,
		select: {
			billing_start: true,
			billing_end: true,
			is_electric: billType === "all",
			is_gas: billType === "all",
			usage_kwh: true,
			rate_kwh: true,
			standing_order_rate: true,
			standing_order_charge_days: true,
			pre_tax: true,
			after_tax: true,
		},
		where: {
			AND: {
				billing_start: {
					gte: startDate,
				},
				billing_end: {
					lte: endDate,
				},
			},
		},
		orderBy: {
			billing_start: "desc",
		},
	});
};

const retrieveElectricBill = async (
	billType: "gas" | "electric" | "all",
	startDate: Date,
	endDate: Date,
	limit: number
): Promise<energy_bill[]> => {
	return await prisma.energy_bill.findMany({
		take: limit,
		select: {
			billing_start: true,
			billing_end: true,
			is_electric: billType === "all",
			is_gas: billType === "all",
			usage_kwh: true,
			rate_kwh: true,
			standing_order_rate: true,
			standing_order_charge_days: true,
			pre_tax: true,
			after_tax: true,
		},
		where: {
			AND: {
				is_electric: true,
				billing_start: {
					gte: startDate,
				},
				billing_end: {
					lte: endDate,
				},
			},
		},
		orderBy: {
			billing_start: "desc",
		},
	});
};

const retrieveGasBill = async (
	billType: "gas" | "electric" | "all",
	startDate: Date,
	endDate: Date,
	limit: number
): Promise<energy_bill[]> => {
	return await prisma.energy_bill.findMany({
		take: limit,
		select: {
			billing_start: true,
			billing_end: true,
			is_electric: billType === "all",
			is_gas: billType === "all",
			usage_kwh: true,
			rate_kwh: true,
			standing_order_rate: true,
			standing_order_charge_days: true,
			pre_tax: true,
			after_tax: true,
		},
		where: {
			AND: {
				is_gas: true,
				billing_start: {
					gte: startDate,
				},
				billing_end: {
					lte: endDate,
				},
			},
		},
		orderBy: {
			billing_start: "desc",
		},
	});
};

const updateBill = async (updatedData: EnergyBillPayload) => {
	const preTax =
		updatedData.standingChargeDays +
		Number(updatedData.kwhUsage) * Number(updatedData.kwhRate);
	return await prisma.energy_bill.update({
		where: {
			is_electric_is_gas_billing_start_billing_end: {
				is_electric: updatedData.billType === "electric",
				is_gas: updatedData.billType === "gas",
				billing_start: new Date(updatedData.startDate),
				billing_end: new Date(updatedData.endDate),
			},
		},
		data: {
			standing_order_charge_days: updatedData.standingChargeDays,
			standing_order_rate: updatedData.standingChargeDays,
			usage_kwh: updatedData.kwhUsage,
			rate_kwh: updatedData.kwhRate,
			pre_tax: preTax,
			after_tax: preTax * 1.05,
		},
	});
};

export type EnergyBillRetrieval = z.infer<typeof EnergyBillRetrievalSchema>;
export type EnergyBillPayload = z.infer<typeof EnergyBillPayloadSchema>;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const EnergyBillRetrievalSchema = z.object({
	billType: z.enum(["gas", "electric", "all"], {
		errorMap: () => {
			return { message: "Must either be 'gas', 'electric' or 'all'" };
		},
	}),
	startDate: z.coerce
		.date()
		.min(new Date("2000-01-01"), { message: "Start date too early" })
		.max(tomorrow, {
			message: "Cannot retrieve data with start dates for the future",
		}),
	endDate: z.coerce
		.date()
		.min(new Date("2000-01-01"), { message: "End date too early" })
		.max(tomorrow, {
			message: "Cannot retrieve data with end dates in the future",
		})
		.optional(),
});

const EnergyBillPayloadSchema = z.object({
	billType: z.enum(["gas", "electric"], {
		errorMap: () => {
			return { message: "Must either be 'gas' or 'electric'" };
		},
	}),
	startDate: z.coerce
		.date()
		.min(new Date("2000-01-01"), { message: "Start date too early" })
		.max(tomorrow, {
			message: "Start date cannot be in the future",
		}),
	endDate: z.coerce
		.date()
		.min(new Date("2000-01-01"), { message: "End date too early" })
		.max(tomorrow, {
			message: "End date cannot be in the future",
		}),
	standingChargeDays: z
		.number()
		.min(0, { message: "Cannot have less than 1 day standing charge rate" })
		.max(365, { message: "Cannot have standing charge for over a year" }),
	standingChargeRate: z
		.number()
		.min(0, { message: "Standing charge cannot be free" })
		.max(1000, { message: "Standing charge cannot be higher than 1000p/day" }),
	kwhUsage: z.number().min(0, { message: "Cannot have 0 usage" }).max(2500, {
		message: "More than 2500kWh used in a month is likely too high",
	}),
	kwhRate: z.number().min(0, { message: "kwh rate cannot be free" }).max(2000, {
		message: "More than £20/kWhis likely too high",
	}),
});
