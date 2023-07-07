import Log from "@/log";
// import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
// import fs from "fs";
const log = new Log("bin");

const fileURL = "https://opendata.leeds.gov.uk/downloads/bins/dm_jobs.csv";
// const destinationFolder = "./bindata.csv";

const downloadSourceFile = async () => {
	const response = await fetch(fileURL);

	if (response.status !== 200) {
		log.error(`Failed to download source file with error ${response.status}`);
		return;
	}

	if (!response.body) {
		log.error(`Response had no body`);
		return;
	}

	// const dest = fs.createWriteStream(destinationFolder, { highWaterMark: 16 });
	// console.log(response.body);
	// await response.body.pipeTo(dest);
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await downloadSourceFile();
	res.status(200).end();
}
