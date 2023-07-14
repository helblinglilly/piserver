import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Selector from "../Selector";
import { EnergyUsageRow } from "@/db/Energy";
import Notification from "../Notification";
import DatePicker from "../DatePicker";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DailyChartData {
	date: string;
	Electricity: number;
	Gas: number;
}
export default function DailyRundownChart() {
	const router = useRouter();

	const [toDate, setToDate] = useState(
		router.query["date"] ? new Date(router.query.date as string) : new Date()
	);
	const [chartMode] = useState<"spike" | "cummulative">(
		router.query["chartMode"] === "cummulative" ? "cummulative" : "spike"
	);

	const [days, setDays] = useState(3);
	const [chartData, setChartData] = useState<DailyChartData[]>([]);

	const [infoNotification, setInfoNotification] = useState<string[]>([]);

	// Need to refactor the URL change thingy into a helper function. Currently in index.tsx
	// chart mode will not be needed here, but we can't affect it for the hourly mode

	// Should store the amount of days in a queyr param as well
	useEffect(() => {
		setChartData([]);
		const to = new Date(toDate);
		to.setHours(24, 0, 0, 0);

		const from = new Date(to);
		from.setDate(from.getDate() - days);

		const triggerRefetch = async () => {
			const response = await fetch("/api/jobs/energy");
			if (response.status === 204) {
				setInfoNotification(["No more data available, try again later"]);
				return;
			}
			setInfoNotification([]);
			await fetchData(from, to);
		};

		const fetchData = async (from: Date, to: Date) => {
			let response = await fetch(
				`/api/energy/usage?from=${from.toISOString()}&to=${to.toISOString()}`
			);
			if (response.status === 204) {
				setInfoNotification(["No data available, trying to refetch..."]);
				await triggerRefetch();
			}
			if (response.status !== 200) {
				return;
			}
			const body = (await response.json()) as EnergyUsageRow[];
			setInfoNotification([]);

			let accumulatedData: DailyChartData[] = [];

			body.forEach((entry) => {
				const entryDate = new Date(entry.endDate).toLocaleDateString();

				const existingEntry = accumulatedData.find((a) => a.date === entryDate);
				if (existingEntry) {
					existingEntry.Electricity += entry.energyType === "electricity" ? Number(entry.kWh) : 0;
					existingEntry.Gas += entry.energyType === "gas" ? Number(entry.kWh) : 0;
				} else {
					accumulatedData.push({
						date: entryDate,
						Electricity: entry.energyType === "electricity" ? Number(entry.kWh) : 0,
						Gas: entry.energyType === "gas" ? Number(entry.kWh) : 0,
					});
				}
			});

			accumulatedData = accumulatedData.map((a) => {
				return {
					date: a.date,
					Electricity: Number(a.Electricity.toFixed(3)),
					Gas: Number(a.Gas.toFixed(3)),
				}
			}).sort((a, b) => a.date < b.date ? -1 : 1);

			setChartData(accumulatedData);
		};
		fetchData(from, to);
	}, [days, toDate]);

	return (
		<>
			<Notification message={infoNotification} type="warn" />
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<div>
					<p className="title is-4">Daily usage in kWh</p>
					<p>As reported by the smart-metre in 30 minute intervals.</p>
					<p>Data may lag between three to twelve hours.</p>
				</div>
				<div style={{ maxWidth: "50%" }} className="mb-2">
					<DatePicker
						name="dateSelector"
						changeHandler={(date) => {
							setToDate(date);
							router.replace(
								`/energy/usage?date=${date.toISOString()}&chartMode=${chartMode}&mode=daily`
							);
						}}
						initialDate={toDate}
						minDate={new Date(0)}
						maxDate={new Date()}
						isReadOnly={false}
					/>
					<Selector
						possibleValues={[2, 3, 5, 7, 14]}
						initialValue={days}
						supplementary="days"
						onSelectHandler={setDays}
						className="mt-2"
						style={{ width: "100%" }}
					/>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={400} className="mb-3">
				<BarChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }} data={chartData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis yAxisId="left" orientation="left" />
					<YAxis yAxisId="right" orientation="right" />
					<Tooltip />
					<Legend />
					<Bar yAxisId="left" dataKey="Electricity" stroke="#fabf34"fill="#fadc34" />
					<Bar yAxisId="right" dataKey="Gas" stroke="#2d5ff7" fill="#7396ff" />
				</BarChart>
			</ResponsiveContainer>
		</>
	);
}
