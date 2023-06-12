import Selector from "@/components/Selector";
// import DatePicker from "@/components/DatePicker";
import { energy_usage } from "@prisma/client";
import { useEffect, useState } from "react";
import {
	ResponsiveContainer,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Area,
} from "recharts";

type UsageData = {
	start_date: Date;
	end_date: Date;
	kwh_electric: number;
	kwh_gas: number;
};
export default function EnergyIndex() {
	const yesterday = new Date();
	yesterday.setDate(new Date().getDate() - 1);

	const [selectedDate] = useState(yesterday);
	const [selectedMode, setSelectedMode] = useState<"hourly" | "daily">(
		"hourly"
	);
	const [selectedDays, setSelectedDays] = useState(3);
	const [displayMode, setDisplayMode] = useState<"cummulative" | "individual">(
		"individual"
	);

	const [data, setData] = useState<UsageData[]>([]);

	const [accumulativeData, setAccumulativeData] = useState<UsageData[]>([]);

	const combineUsageData = (input: energy_usage[]) => {
		const combined: UsageData[] = [];

		input.forEach((usage) => {
			const findFn = (a: { start_date: Date }) =>
				a.start_date.valueOf() === new Date(usage.start_date).valueOf();

			const existing = combined.find((a) => findFn(a));
			const existingId = combined.findIndex((a) => findFn(a));

			if (!existing) {
				combined.push({
					start_date: new Date(usage.start_date),
					end_date: new Date(usage.end_date),
					kwh_electric: usage.is_electric ? usage.usage_kwh : -1,
					kwh_gas: usage.is_gas ? usage.usage_kwh : -1,
				});
			} else {
				if (existing.kwh_electric === -1) {
					existing.kwh_electric = usage.usage_kwh;
				} else if (existing.kwh_gas === -1) {
					existing.kwh_gas = usage.usage_kwh;
				}
				combined.splice(existingId, 1);
				combined.push(existing);
			}
		});
		return combined;
	};

	useEffect(() => {
		const fetchData = async (from: Date, to: Date) => {
			let response = await fetch(
				`/api/energy/usage?from=${from.toISOString()}&to=${to.toISOString()}`
			);
			if (response.status !== 200) {
				setData([]);
				return;
			}

			const responseUsage = (await response.json()) as energy_usage[];

			const combined = combineUsageData(responseUsage);
			setData(combined);

			let electricAcc = 0.0;
			let gasAcc = 0.0;
			const accumulated = combined.map((usage) => {
				electricAcc += usage.kwh_electric;
				gasAcc += usage.kwh_gas;
				return {
					start_date: usage.start_date,
					end_date: usage.end_date,
					kwh_electric: electricAcc,
					kwh_gas: gasAcc,
				};
			});

			setAccumulativeData(accumulated);
		};

		let from = new Date();
		let to = new Date();

		if (selectedMode === "hourly") {
			from = new Date(selectedDate);
			from.setHours(0);
			from.setMinutes(0);
			from.setSeconds(0);
			from.setMilliseconds(0);
			to = new Date(from);
			to.setDate(from.getDate() + 1);
		} else if (selectedMode === "daily") {
			to = new Date(selectedDate);
			// to.setDate(to.getDate() );
			to.setHours(0);
			to.setMinutes(30);
			to.setSeconds(0);
			to.setMilliseconds(0);
			from = new Date(to);
			from.setDate(to.getDate() - selectedDays);
		}
		fetchData(from, to);
	}, [selectedDate, selectedMode, selectedDays]);

	const formatDatesToTime = (data: UsageData[]) => {
		return data
			.map((a) => {
				return {
					start_date: a.start_date.toLocaleTimeString("en-GB", {
						hour12: false,
					}),
					end_date: a.end_date.toLocaleTimeString("en-GB", { hour12: false }),
					Electric: Number(a.kwh_electric.toFixed(4)),
					Gas: Number(a.kwh_gas.toFixed(4)),
				};
			})
			.filter((a) => a.Electric > -1 && a.Gas > -1);
	};

	const formatDatesToDays = (data: UsageData[]) => {
		return data
			.map((a) => {
				return {
					start_date: a.start_date.toLocaleDateString("en-GB", {
						hour12: false,
					}),
					end_date: a.end_date.toLocaleDateString("en-GB", { hour12: false }),
					Electric: Number(a.kwh_electric.toFixed(4)),
					Gas: Number(a.kwh_gas.toFixed(4)),
				};
			})
			.filter((a) => a.Electric > -1 && a.Gas > -1);
	};

	const aggregateToDays = (data: UsageData[]) => {
		const combined: { date: Date; Electric: number; Gas: number }[] = [];

		data.forEach((entry) => {
			const entryDate = entry.end_date;
			entryDate.setHours(0);
			entryDate.setMinutes(0);
			entryDate.setMinutes(0);
			entryDate.setMilliseconds(0);

			const existingId = combined.findIndex(
				(a) => a.date.valueOf() === entryDate.valueOf()
			);

			if (existingId === -1) {
				combined.push({
					date: entryDate,
					Electric: entry.kwh_electric,
					Gas: entry.kwh_gas,
				});
				return;
			}

			combined[existingId].Electric += entry.kwh_electric;
			combined[existingId].Gas += entry.kwh_gas;
		});
		return combined
			.sort((a, b) => (a.date < b.date ? 1 : -1))
			.filter((a) => a.Electric > -0.5 && a.Gas > -0.5)
			.map((a) => {
				return {
					Date: a.date.toLocaleDateString("en-GB"),
					Electric: a.Electric.toFixed(4),
					Gas: a.Gas.toFixed(4),
				};
			});
	};

	return (
		<>
			<div className="box">
				<div className="tabs is-fullwidth">
					<ul>
						<li
							onClick={() => setSelectedMode("hourly")}
							className={selectedMode === "hourly" ? "is-active" : ""}
						>
							<a>Hourly</a>
						</li>
						<li
							onClick={() => setSelectedMode("daily")}
							className={selectedMode === "daily" ? "is-active" : ""}
						>
							<a>Daily</a>
						</li>
					</ul>
					<div></div>
				</div>

				{selectedMode === "hourly" && (
					<>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<div>
								<p className="title is-4">Hourly usage in kWh</p>
								<p>
									As reported by the smart-metre in 30 minute intervals,
									displaying the end time of that interval. Data may lag between
									three to twelve hours.
								</p>
							</div>
							<div style={{ maxWidth: "50%" }} className="mb-2">
								{/*<DatePicker
									name="dateSelector"
									changeHandler={setSelectedDate}
									initialDate={selectedDate}
									minDate={new Date(0)}
									maxDate={new Date()}
									isReadOnly={false}
								/>*/}
								<button
									className={`button mt-2 ${
										displayMode === "cummulative" ? "is-info" : ""
									}`}
									onClick={() =>
										displayMode === "cummulative"
											? setDisplayMode("individual")
											: setDisplayMode("cummulative")
									}
									style={{ width: "100%" }}
								>
									Accumulative
								</button>
							</div>
						</div>

						{displayMode === "individual" ? (
							<ResponsiveContainer width="100%" height={400} className="mb-3">
								<AreaChart
									data={formatDatesToTime(data)}
									margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="end_date" />
									<YAxis />
									<Tooltip />
									<Area
										type="monotone"
										dataKey="Electric"
										stroke="#fabf34"
										fill="#fadc34"
									/>
									<Area
										type="monotone"
										dataKey="Gas"
										stroke="#2d5ff7"
										fill="#7396ff"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<ResponsiveContainer width="100%" height={400} className="mb-3">
								<AreaChart
									data={formatDatesToTime(accumulativeData)}
									margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="end_date" />
									<YAxis />
									<Tooltip />
									<Area
										type="monotone"
										dataKey="Electric"
										stroke="#fabf34"
										fill="#fadc34"
									/>
									<Area
										type="monotone"
										dataKey="Gas"
										stroke="#2d5ff7"
										fill="#7396ff"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</>
				)}
				{selectedMode === "daily" && (
					<>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<div>
								<p className="title is-4">Daily usage in kWh</p>
								<p>As reported by the smart-metre in 30 minute intervals.</p>
								<p>Data may lag between three to twelve hours.</p>
							</div>
							<div style={{ maxWidth: "50%" }} className="mb-2">
								{/*<DatePicker
									name="dateSelector"
									changeHandler={setSelectedDate}
									initialDate={selectedDate}
									minDate={new Date(0)}
									maxDate={new Date()}
									isReadOnly={false}
								/>*/}
								<Selector
									possibleValues={[2, 3, 5, 7, 14]}
									initialValue={selectedDays}
									supplementary="days"
									onSelectHandler={setSelectedDays}
									className="mt-2"
									style={{ width: "100%" }}
								/>
							</div>
						</div>

						{displayMode === "individual" ? (
							<ResponsiveContainer width="100%" height={400} className="mb-3">
								<AreaChart
									data={aggregateToDays(data)}
									margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="Date" />
									<YAxis />
									<Tooltip />
									<Area
										type="monotone"
										dataKey="Electric"
										stroke="#fabf34"
										fill="#fadc34"
									/>
									<Area
										type="monotone"
										dataKey="Gas"
										stroke="#2d5ff7"
										fill="#7396ff"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<ResponsiveContainer width="100%" height={400} className="mb-3">
								<AreaChart
									data={formatDatesToDays(accumulativeData)}
									margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="end_date" />
									<YAxis />
									<Tooltip />
									<Area
										type="monotone"
										dataKey="Electric"
										stroke="#fabf34"
										fill="#fadc34"
									/>
									<Area
										type="monotone"
										dataKey="Gas"
										stroke="#2d5ff7"
										fill="#7396ff"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</>
				)}
			</div>
		</>
	);
}
