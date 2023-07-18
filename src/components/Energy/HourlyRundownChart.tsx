import { EnergyUsageRow } from "@/db/EnergyUsage";
import { useEffect, useState } from "react";
import DatePicker from "../DatePicker";
import SpikeChart from "./SpikeChart";
import CummulativeChart from "./CummulativeChart";
import Notification from "../Notification";
import { useRouter } from "next/router";

export default function HourlyRundownChart() {
	const router = useRouter();
	const [chartMode, setChartMode] = useState<"spike" | "cummulative">(
		router.query.chartMode === "cummulative" ? "cummulative" : "spike",
	);
	const [data, setData] = useState<EnergyUsageRow[]>([]);
	const [sums, setSums] = useState<
		{ gas: number; electricity: number } | undefined
	>();
	const [date, setDate] = useState(
		router.query.date ? new Date(router.query.date as string) : new Date(),
	);
	const [infoNotification, setInfoNotification] = useState<string[]>([]);

	useEffect(() => {
		const fromOverride = new Date(date);
		const toOverride = new Date(date);

		fromOverride.setHours(0, 0, 0, 0);
		toOverride.setDate(toOverride.getDate() + 1);

		const fetchData = async (from: Date, to: Date) => {
			let response = await fetch(
				`/api/energy/usage?from=${from.toISOString()}&to=${to.toISOString()}`,
			);
			if (response.status === 204) {
				setInfoNotification(["No data available, trying to refetch..."]);
				const refetchResponse = await fetch("/api/jobs/energy");
				if (refetchResponse.status === 204) {
					setInfoNotification(["No more data available, try again later"]);
					return;
				}
				setInfoNotification([]);
				await fetchData(from, to);
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
						0,
					)
					.toFixed(3),
			);
			let electricitySum = Number(
				body
					.reduce(
						(prev, curr) =>
							curr.energyType === "electricity" ? prev + Number(curr.kWh) : prev,
						0,
					)
					.toFixed(3),
			);
			setSums({ gas: gasSum, electricity: electricitySum });
			setInfoNotification([]);
		};
		fetchData(fromOverride, toOverride);
	}, [date]);

	return (
		<>
			<Notification message={infoNotification} type="warn" />
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<div>
					<p className="title is-4">Hourly usage in kWh</p>
					<p>
						As reported by the smart-metre in 30 minute intervals, displaying the end
						time of that interval. Data may lag between three to twelve hours.
					</p>
				</div>
				<div style={{ maxWidth: "50%" }} className="mb-2">
					<DatePicker
						name="dateSelector"
						changeHandler={(newDate) => {
							setDate(newDate);
							router.replace(
								`/energy/usage?date=${newDate.toISOString()}&chartMode=${chartMode}&mode=hourly`,
							);
						}}
						initialDate={date}
						minDate={new Date(0)}
						maxDate={new Date()}
						isReadOnly={false}
					/>
					<button
						className={`button mt-2 ${chartMode === "cummulative" ? "is-link" : ""}`}
						style={{ width: "100%" }}
						onClick={() => {
							if (chartMode === "spike") {
								setChartMode("cummulative");
								router.replace(
									`/energy/usage?date=${date.toISOString()}&chartMode=cummulative&mode=hourly`,
								);
							} else {
								setChartMode("spike");
								router.replace(
									`/energy/usage?date=${date.toISOString()}&chartMode=spike&mode=hourly`,
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
							<h5 className="title is-5">Electricity: {sums?.electricity} kWh</h5>
						</div>
						<div className="column">
							<h5 className="title is-5">Gas: {sums?.gas} kWh</h5>
						</div>
					</div>
				)}
			</>
		</>
	);
}
