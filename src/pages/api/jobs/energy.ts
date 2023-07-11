import { getLatestUsageEndDate } from "@/db/Energy";
import { NextApiRequest, NextApiResponse } from "next";

const OCTOPUS_BASE_URL = "https://api.octopus.energy/v1/";
const ELECTRIC_URL = `https://api.octopus.energy/v1/electricity-meter-points/${process.env.OCTOPUS_ELECTRIC_MPAN}/meters/${process.env.OCTOPUS_ELECTRIC_SERIAL}/consumption`;

// eslint-disable-next-line no-unused-vars
const GAS_URL = `https://api.octopus.energy/v1/gas-meter-points/${process.env.OCTOPUS_GAS_MPRN}/meters/${process.env.OCTOPUS_GAS_SERIAL}/consumption`;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {

	const lookup = {
		GET: GET,
	};

	const result = lookup[req.method as "GET"];

	if (!result) {
		res.status(405).end();
		return;
	}

	await result(res);
}

interface APIResponse {
  consumption: number;
  interval_start: string;
  interval_end: string;
}

const GET = async (res: NextApiResponse) => {
  const [latestElectricityDate, latesetGasDate] = await Promise.all([
    getLatestUsageEndDate("electricity"), 
    getLatestUsageEndDate("gas")
  ]);

  await Promise.all([
    fetchElectricityData(latestElectricityDate),
    fetchGasData(latesetGasDate)
  ])
  res.status(200).end();
}

const fetchElectricityData = async (startDate: Date, endDate = new Date()) => {
  let completed = false;


  while(!completed){
    const requestURL = `${ELECTRIC_URL}?page_size=1000&period_from=${startDate.toISOString()}&period_to=${endDate.toISOString()}&order_by=period`;
    const response = await octopusAuthedRequest(requestURL) as APIResponse[] | number;
    if (typeof response === "number" || response.length === 0){
      completed = true;
      return;
    }

    

  }
}

const fetchGasData = async (startDate: Date, endDate?: Date) => {
  if (!endDate){
    endDate = new Date();
  }
}

async function octopusAuthedRequest(requestURL: string) {
	const headers = new Headers();
	headers.set(
		"Authorization",
		`Basic ${Buffer.from(`${process.env.OCTOPUS_API_KEY}:${OCTOPUS_BASE_URL}`).toString(
			"base64"
		)}`
	);

	const response = await fetch(requestURL, {
		method: "GET",
		headers,
	});

	console.log(`${response.status} for ${requestURL}`);

	if (response.status === 200) {
		const body = await response.json();
		return body;
	} else {
		return response.status;
	}
}