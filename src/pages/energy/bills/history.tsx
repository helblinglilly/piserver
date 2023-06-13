// import { energy_bill } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Area,
	AreaChart,
	ResponsiveContainer,
} from "recharts";

export default function EnergyBillsHistory() {
	const params = useSearchParams();
	const { push } = useRouter();

	const type = params.get("type")?.toLowerCase();
	const isGas = type === "gas";

	const primaryAreaFillColour = isGas ? "#7396ff" : "#ffea73";
	const primaryStrokeColour = isGas ? "#2d5ff7" : "#fadc34";

	const secondaryAreaFillColour = isGas ? "#4962ab" : "#f2b65c";
	const secondaryStrokeColour = isGas ? "#2044ab" : "#eda02d";

	const [bills, setBills] = useState<any[]>([]);
	const [chartBills, setChartBills] = useState<
		{
			date: string;
			bill: number;
			kWh: number;
			"kWh Rate": number;
			standingChargeRate: number;
		}[]
	>([]);
	const [warningMessage, setWarningMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		if (!type || !["gas", "electric"].includes(type)) {
			push("/energy/bills");
		}

		const fetchBills = async () => {
			let response = await fetch(
				`/api/energy/bill?endDate=${new Date().toISOString()}&limit=12&type=${
					isGas ? "gas" : "electric"
				}`
			);
			if (response.status === 200) {
				const repsonseBills = (await response.json()) as any[];
				setBills(repsonseBills);

				const responseChartBills = repsonseBills.map((a) => {
					return {
						date: new Date(a.billing_end).toLocaleDateString(),
						bill: Number(a.after_tax),
						kWh: Number(a.usage_kwh),
						"kWh Rate": Number(a.rate_kwh),
						standingChargeRate: Number(a.standing_order_rate),
					};
				});

				responseChartBills.sort((a, b) =>
					a.date.valueOf() >= b.date.valueOf() ? 1 : -1
				);
				setChartBills(responseChartBills);
			} else if (response.status === 204) {
				setWarningMessage(
					"No bill available to view. Have any bills been recorded yet?"
				);
			} else {
				setErrorMessage(
					`Request to get bills has failed with error code ${response.status} - ${response.statusText}`
				);
			}
		};
		fetchBills();
	}, [isGas, push, type]);

	return (
		<>
			<p className="title is-3">View {isGas ? "Gas" : "Electricity"} Bills</p>

			<div
				className="notification is-warning"
				style={warningMessage.length > 0 ? {} : { display: "none" }}
			>
				{warningMessage}
			</div>

			<div
				className="notification is-danger"
				style={errorMessage.length > 0 ? {} : { display: "none" }}
			>
				{errorMessage}
			</div>

			{chartBills.length > 0 ? (
				<div className="card mb-3">
					<div className="card-content">
						<p className="title is-4">History</p>
						<p className="title is-5">kWh rates</p>
						<ResponsiveContainer width="100%" height={400} className="mb-3">
							<AreaChart
								data={chartBills}
								margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="kWh"
									stroke={primaryStrokeColour}
									fill={primaryAreaFillColour}
								/>
								<Area
									type="monotone"
									dataKey="kWh Rate"
									stroke={secondaryStrokeColour}
									fill={secondaryAreaFillColour}
								/>
							</AreaChart>
						</ResponsiveContainer>

						<p className="title is-5">Bills</p>
						<ResponsiveContainer width="100%" height={400}>
							<AreaChart
								data={chartBills}
								margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="bill"
									stroke={secondaryStrokeColour}
									fill={secondaryAreaFillColour}
								/>
								<Area
									type="monotone"
									dataKey="standingChargeRate"
									stroke={primaryStrokeColour}
									fill={primaryAreaFillColour}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			) : (
				<p>No data</p>
			)}

			{bills.length === 0 ? (
				<></>
			) : (
				bills.map((bill) => (
					<div className="card mb-4" key={`${bill.billing_start}`}>
						<div className="card-header">
							<div className="card-header-title">
								<p>
									{new Date(bill.billing_start).toLocaleDateString()} -{" "}
									{new Date(bill.billing_end).toLocaleDateString()}
								</p>
							</div>
						</div>
						<div className="card-content">
							<div className="columns">
								<div className="column">
									<p>
										Covers: {bill.standing_order_charge_days}{" "}
										{bill.standing_order_charge_days === 1 ? "Day" : "Days"}
									</p>
								</div>
								<div className="column">
									<p>
										Standing charge rate: {bill.standing_order_rate.toString()}
										p/day
									</p>
								</div>
							</div>
							<div className="columns">
								<div className="column">
									<p>
										Usage: {Number(bill.usage_kwh).toFixed(2).toString()} kWh
									</p>
								</div>
								<div className="column">
									<p>kWh rate: {bill.rate_kwh.toString()}p/kWh</p>
								</div>
							</div>
							<div className="columns">
								<div className="column">
									Total amount: £{Number(bill.after_tax).toFixed(2).toString()}
								</div>
								<div className="column">
									<Link
										href={`/energy/bills/edit?type=${
											type === "gas" ? "gas" : "electric"
										}&startDate=${bill.billing_start.toString().split("T")[0]}`}
									>
										<button className="button">Edit</button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				))
			)}
		</>
	);
}
