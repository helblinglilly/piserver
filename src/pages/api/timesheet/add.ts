// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";
// import { PrismaClient, timesheet, timesheet_breaks } from "@prisma/client";
// import {
// 	Decimal,
// 	PrismaClientKnownRequestError,
// } from "@prisma/client/runtime/library";

// const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		try {
			TimesheetRetrievalSchema.parse(req.body);
		} catch (validationError) {
			if (validationError instanceof ZodError) {
				const errorMessages = validationError.issues.map((i) => i.message);
				res.status(400).json({ errors: errorMessages });
				return;
			}
		}
		res.status(200).end();
	}
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export type TimesheetData = z.infer<typeof TimesheetRetrievalSchema>;

const TimesheetRetrievalSchema = z.object({
	date: z
		.date()
		.min(new Date("2000-01-01"), { message: "Insert entry too early" })
		.max(tomorrow, { message: "Cannot set timesheets for the future" }),
	action: z.enum(["clockIn", "breakIn", "breakOut", "clockOut"], {
		errorMap: () => {
			return {
				message:
					"Action must either be 'clockIn', 'breakIn', 'breakOut' or 'clockOut'",
			};
		},
	}),
	timeValue: z
		.date()
		.min(new Date("2000-01-01"), { message: "Insert entry too early" })
		.max(tomorrow, { message: "Cannot set timesheet entries for the future" }),
});
