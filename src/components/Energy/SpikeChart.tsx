import { EnergyUsageRow } from "@/db/EnergyUsage";
import { useEffect, useState } from "react";
import {
	ResponsiveContainer,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Area,
	Legend,
} from "recharts";

export default function SpikeChart({
	data: inputData,
	includeDay,
}: {
	data: EnergyUsageRow[];
	includeDay?: boolean;
}) {
	interface CombinedData {
		endTime: string;
		Electricity: number;
		Gas: number;
	}

	const [data, setData] = useState<CombinedData[]>([]);

	useEffect(() => {
		const combinedData: CombinedData[] = [];

		const sorted = inputData.sort((a, b) =>
			a.startDate < b.startDate ? -1 : 1
		);

		sorted.forEach((row) => {
			const existingRow = combinedData.find(
				(combinedRow) =>
					combinedRow.endTime === (row.endDate as unknown as string)
			);

			if (existingRow) {
				if (existingRow.Electricity) {
					existingRow.Gas = row.kWh;
				} else {
					existingRow.Electricity = row.kWh;
				}
			} else {
				combinedData.push({
					endTime: row.endDate as unknown as string,
					Electricity: row.energyType === "electricity" ? row.kWh : 0,
					Gas: row.energyType === "gas" ? row.kWh : 0,
				});
			}
		});

		setData(
			combinedData.map((a) => {
				return {
					...a,
					endTime: includeDay
						? new Date(a.endTime).toLocaleString()
						: new Date(a.endTime).toLocaleTimeString(),
				};
			})
		);
	}, [inputData, includeDay]);

	return data.length === 0 ? (
		<div className="mt-3 pt-3">
			<p>No data for this day</p>
		</div>
	) : (
		<ResponsiveContainer width="100%" height={400} className="mb-3">
			<AreaChart
				data={data}
				margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="endTime" />
				<YAxis />
				<Tooltip />
				<Legend />
				<Area
					type="monotone"
					dataKey="Electricity"
					stroke="#fabf34"
					fill="#fadc34"
				/>
				<Area type="monotone" dataKey="Gas" stroke="#2d5ff7" fill="#7396ff" />
			</AreaChart>
		</ResponsiveContainer>
	);
}
