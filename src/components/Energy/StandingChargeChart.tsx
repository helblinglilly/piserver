import React from "react";
import { StandingCharges } from "@/pages/energy/bills";
import {
	ResponsiveContainer,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	Area,
} from "recharts";

export default function StandingChargeChart({
	standingCharges,
}: {
	standingCharges: StandingCharges[];
}) {
	const electricityCharges = standingCharges.filter(
		(entry) => entry.type === "electricity",
	);
	const gasCharges = standingCharges.filter((entry) => entry.type === "gas");

	const data: { Date: string; Electric: number; Gas: number }[] = [];

	electricityCharges.forEach((entry) => {
		const displayDate = entry.endDate.toLocaleDateString("en-GB");

		const existing = data.find((a) => a.Date === displayDate);
		if (!existing) {
			data.push({ Date: displayDate, Electric: entry.standingCharge, Gas: 0 });
			return;
		}
		existing.Electric = entry.standingCharge;
	});

	gasCharges.forEach((entry) => {
		const displayDate = entry.endDate.toLocaleDateString("en-GB");

		const existing = data.find((a) => a.Date === displayDate);
		if (!existing) {
			data.push({ Date: displayDate, Electric: 0, Gas: entry.standingCharge });
			return;
		}
		existing.Gas = entry.standingCharge;
	});

	return (
		<ResponsiveContainer width="100%" height={400} className="mb-3">
			<AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="Date" />
				<YAxis />
				<Tooltip />
				<Legend />
				<Area type="monotone" dataKey="Electric" stroke="#fabf34" fill="#fadc34" />
				<Area type="monotone" dataKey="Gas" stroke="#2d5ff7" fill="#7396ff" />
			</AreaChart>
		</ResponsiveContainer>
	);
}
