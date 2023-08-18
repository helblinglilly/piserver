import Log from "@/log";
// import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
// import fs from "fs";

const fileURL = "https://opendata.leeds.gov.uk/downloads/bins/dm_jobs.csv";
// const destinationFolder = "./bindata.csv";

const downloadSourceFile = async () => {
	const response = await fetch(fileURL);

	if (response.status !== 200) {
		Log.error(`Failed to download source file with error ${response.status}`);
		return;
	}

	if (!response.body) {
		Log.error("Response had no body");
		return;
	}
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	await downloadSourceFile();
	res.status(200).end();
}
