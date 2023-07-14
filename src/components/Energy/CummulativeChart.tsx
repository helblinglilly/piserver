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

export default function CummulativeChart({
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

		sorted
			.map((a) => a.endDate)
			.forEach((date) => {
				const potentialExistingRow = combinedData.find(
					(a) => a.endTime === new Date(date).toISOString()
				);

				if (potentialExistingRow) return;

				combinedData.push({
					endTime: new Date(date).toISOString(),
					Electricity: 0,
					Gas: 0,
				});
			});

		let gasRunning = 0;
		let electricityRunning = 0;

		sorted.forEach((row) => {
			const existingRowIndex = combinedData.findIndex(
				(combinedRow) =>
					combinedRow.endTime === (row.endDate as unknown as string)
			);

			if (row.energyType === "electricity") {
				electricityRunning += Number(row.kWh);
				combinedData[existingRowIndex].Electricity = electricityRunning;
			} else if (row.energyType === "gas") {
				gasRunning += Number(row.kWh);
				combinedData[existingRowIndex].Gas = gasRunning;
			}
		});

		setData(
			combinedData.map((a) => {
				return {
					Gas: Number(a.Gas.toFixed(3)),
					Electricity: Number(a.Electricity.toFixed(3)),
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
