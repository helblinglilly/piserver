import { useRouter } from "next/router";
import DatePicker from "../DatePicker";
import { useEffect, useState } from "react";
import Selector from "../Selector";
import { EnergyUsageRow } from "@/db/Energy";
import SpikeChart from "./SpikeChart";

export default function DailyRundownChart() {
	const router = useRouter();

	const [toDate, setToDate] = useState(
		router.query["date"] ? new Date(router.query.date as string) : new Date()
	);
	const [chartMode, setChartMode] = useState<"spike" | "cummulative">(
		router.query["chartMode"] === "cummulative" ? "cummulative" : "spike"
	);

	const [days, setDays] = useState(3);
	const [data, setData] = useState<EnergyUsageRow[]>([]);
	const [infoNotification, setInfoNotification] = useState<string[]>([]);

	// Need to refactor the URL change thingy into a helper function. Currently in index.tsx
	// chart mode will not be needed here, but we can't affect it for the hourly mode

	// Should store the amount of days in a queyr param as well
	useEffect(() => {
		setData([]);
		console.log("retrigger");
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
			setData(body);
			setInfoNotification([]);
		};
		fetchData(from, to);
	}, [days, toDate]);

	return (
		<>
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

			<SpikeChart data={data} includeDay />
		</>
	);
}
