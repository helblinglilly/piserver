import { EnergyUsageRow } from "@/db/Energy";
import { useEffect, useState } from "react";
import DatePicker from "../DatePicker";
import SpikeChart from "./SpikeChart";
import CummulativeChart from "./CummulativeChart";
import Notification from "../Notification";
import { useRouter } from "next/router";

export default function HourlyRundownChart() {
	const router = useRouter();
	const [chartMode, setChartMode] = useState<"spike" | "cummulative">(
		router.query["chartMode"] === "cummulative" ? "cummulative" : "spike"
	);
	const [data, setData] = useState<EnergyUsageRow[]>([]);
	const [sums, setSums] = useState<
		{ gas: number; electricity: number } | undefined
	>();
	const [date, setDate] = useState(
		router.query["date"] ? new Date(router.query.date as string) : new Date()
	);
	const [infoNotification, setInfoNotification] = useState<string[]>([]);

	useEffect(() => {
		const from = new Date(date);
		const to = new Date(date);

		from.setHours(0, 0, 0, 0);
		to.setDate(to.getDate() + 1);

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
			setData(body);
			let gasSum = Number(
				body
					.reduce(
						(prev, curr) =>
							curr.energyType === "gas" ? prev + Number(curr.kWh) : prev,
						0
					)
					.toFixed(3)
			);
			let electricitySum = Number(
				body
					.reduce(
						(prev, curr) =>
							curr.energyType === "electricity"
								? prev + Number(curr.kWh)
								: prev,
						0
					)
					.toFixed(3)
			);
			setSums({ gas: gasSum, electricity: electricitySum });
			setInfoNotification([]);
		};
		fetchData(from, to);
	}, [date]);

	return (
		<>
			<Notification message={infoNotification} type="warn" />
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<div>
					<p className="title is-4">Hourly usage in kWh</p>
					<p>
						As reported by the smart-metre in 30 minute intervals, displaying
						the end time of that interval. Data may lag between three to twelve
						hours.
					</p>
				</div>
				<div style={{ maxWidth: "50%" }} className="mb-2">
					<DatePicker
						name="dateSelector"
						changeHandler={(date) => {
							setDate(date);
							router.replace(
								`/energy/usage?date=${date.toISOString()}&chartMode=${chartMode}&mode=hourly`
							);
						}}
						initialDate={date}
						minDate={new Date(0)}
						maxDate={new Date()}
						isReadOnly={false}
					/>
					<button
						className={`button mt-2 ${
							chartMode === "cummulative" ? "is-link" : ""
						}`}
						style={{ width: "100%" }}
						onClick={() => {
							if (chartMode === "spike") {
								setChartMode("cummulative");
								router.replace(
									`/energy/usage?date=${date.toISOString()}&chartMode=cummulative&mode=hourly`
								);
							} else {
								setChartMode("spike");
								router.replace(
									`/energy/usage?date=${date.toISOString()}&chartMode=spike&mode=hourly`
								);
							}
						}}
					>
						Cummulative
					</button>
				</div>
			</div>
			<>
				{chartMode === "spike" ? (
					<SpikeChart data={data} />
				) : (
					<CummulativeChart data={data} />
				)}

				{data.length > 0 && (
					<div className="columns mt-2">
						<div className="column">
							<h5 className="title is-5">
								Electricity: {sums?.electricity} kWh
							</h5>
						</div>
						<div className="column">
							<h5 className="title is-5">Gas: {sums?.gas} kWh</h5>
						</div>
					</div>
				)}
			</>
		</>

		// 		{selectedMode === "daily" && (
		// 			<>
		// 				<div style={{ display: "flex", justifyContent: "space-between" }}>
		// 					<div>
		// 						<p className="title is-4">Daily usage in kWh</p>
		// 						<p>As reported by the smart-metre in 30 minute intervals.</p>
		// 						<p>Data may lag between three to twelve hours.</p>
		// 					</div>
		// 					<div style={{ maxWidth: "50%" }} className="mb-2">
		// 						<DatePicker
		// 							name="dateSelector"
		// 							changeHandler={setSelectedDate}
		// 							initialDate={selectedDate}
		// 							minDate={new Date(0)}
		// 							maxDate={new Date()}
		// 							isReadOnly={false}
		// 						/>
		// 						<Selector
		// 							possibleValues={[2, 3, 5, 7, 14]}
		// 							initialValue={selectedDays}
		// 							supplementary="days"
		// 							onSelectHandler={setSelectedDays}
		// 							className="mt-2"
		// 							style={{ width: "100%" }}
		// 						/>
		// 					</div>
		// 				</div>

		// 				{displayMode === "individual" ? (
		// 					<ResponsiveContainer width="100%" height={400} className="mb-3">
		// 						<AreaChart
		// 							data={aggregateToDays(data)}
		// 							margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
		// 						>
		// 							<CartesianGrid strokeDasharray="3 3" />
		// 							<XAxis dataKey="Date" />
		// 							<YAxis />
		// 							<Tooltip />
		// 							<Area
		// 								type="monotone"
		// 								dataKey="Electric"
		// 								stroke="#fabf34"
		// 								fill="#fadc34"
		// 							/>
		// 							<Area
		// 								type="monotone"
		// 								dataKey="Gas"
		// 								stroke="#2d5ff7"
		// 								fill="#7396ff"
		// 							/>
		// 						</AreaChart>
		// 					</ResponsiveContainer>
		// 				) : (
		// 					<ResponsiveContainer width="100%" height={400} className="mb-3">
		// 						<AreaChart
		// 							data={formatDatesToDays(accumulativeData)}
		// 							margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
		// 						>
		// 							<CartesianGrid strokeDasharray="3 3" />
		// 							<XAxis dataKey="end_date" />
		// 							<YAxis />
		// 							<Tooltip />
		// 							<Area
		// 								type="monotone"
		// 								dataKey="Electric"
		// 								stroke="#fabf34"
		// 								fill="#fadc34"
		// 							/>
		// 							<Area
		// 								type="monotone"
		// 								dataKey="Gas"
		// 								stroke="#2d5ff7"
		// 								fill="#7396ff"
		// 							/>
		// 						</AreaChart>
		// 					</ResponsiveContainer>
		// 				)}
		// 			</>
		// 		)}
		// 	</div>
		// </>
	);
}
