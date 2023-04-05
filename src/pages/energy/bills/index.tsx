import Selector from "@/components/Selector";
import RootAppCard from "@/components/rootAppCard";
import { energy_bill } from "@prisma/client";
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
export default function EnergyBills() {
	const [bills, setBills] = useState<
		{
			date: string;
			gasBill: number;
			electricBill: number;
			gasUsage: number;
			electricUsage: number;
			gasRate: number;
			electricRate: number;
			gasStandingCharge: number;
			electricStandingCharge: number;
		}[]
	>([]);

	const [selectedGraph, setSelectedGraph] = useState("Costs");
	const [monthsDisplayed, setMonthsDisplayed] = useState<number>(6);

	const mapForBillData = () => {
		return bills.map((bill) => {
			return {
				Date: bill.date,
				Gas: bill.gasBill,
				Electric: bill.electricBill,
			};
		});
	};

	const mapForUsage = () => {
		return bills.map((bill) => {
			return {
				Date: bill.date,
				Gas: bill.gasUsage,
				Electric: bill.electricUsage,
			};
		});
	};

	const mapForRate = () => {
		return bills.map((bill) => {
			return {
				Date: bill.date,
				Gas: bill.gasRate,
				Electric: bill.electricRate,
			};
		});
	};

	const mapForStandingCharge = () => {
		return bills.map((bill) => {
			return {
				Date: bill.date,
				Gas: bill.gasStandingCharge,
				Electric: bill.electricStandingCharge,
			};
		});
	};
	useEffect(() => {
		const fetchBills = async (months: number) => {
			const startDate = new Date();
			startDate.setMonth(startDate.getMonth() - months);

			let response = await fetch(
				`/api/energy/bill?endDate=${new Date().toISOString()}&startDate=${
					startDate.toISOString().split("T")[0]
				}`
			);

			if (response.status === 200) {
				const repsonseBills = (await response.json()) as energy_bill[];
				const responseCombinedBills: {
					date: string;
					gasBill: number;
					electricBill: number;
					gasUsage: number;
					electricUsage: number;
					gasRate: number;
					electricRate: number;
					gasStandingCharge: number;
					electricStandingCharge: number;
				}[] = [];

				repsonseBills.forEach((bill) => {
					if (bill.standing_order_charge_days < 20) return;
					const existing = responseCombinedBills.find(
						(a) => a.date === new Date(bill.billing_end).toLocaleDateString()
					);
					const existingId = responseCombinedBills.findIndex(
						(a) => a.date === new Date(bill.billing_end).toLocaleDateString()
					);

					if (!existing) {
						responseCombinedBills.push({
							date: new Date(bill.billing_end).toLocaleDateString(),
							gasBill: bill.is_gas ? Number(bill.after_tax) : 0,
							electricBill: bill.is_electric ? Number(bill.after_tax) : 0,
							gasUsage: bill.is_gas ? Number(bill.usage_kwh) : 0,
							electricUsage: bill.is_electric ? Number(bill.usage_kwh) : 0,
							gasRate: bill.is_gas ? Number(bill.rate_kwh) : 0,
							electricRate: bill.is_electric ? Number(bill.rate_kwh) : 0,
							gasStandingCharge: bill.is_gas
								? Number(bill.standing_order_rate)
								: 0,
							electricStandingCharge: bill.is_electric
								? Number(bill.standing_order_rate)
								: 0,
						});
					} else {
						if (existing.electricBill === 0 && bill.is_electric) {
							existing.electricBill = Number(bill.after_tax);
							existing.electricUsage = Number(bill.usage_kwh);
							existing.electricRate = Number(bill.rate_kwh);
							existing.electricStandingCharge = Number(
								bill.standing_order_rate
							);
						} else if (existing.gasBill === 0 && bill.is_gas) {
							existing.gasBill = Number(bill.after_tax);
							existing.gasUsage = Number(bill.usage_kwh);
							existing.gasRate = Number(bill.rate_kwh);
							existing.gasStandingCharge = Number(bill.standing_order_rate);
						}
						responseCombinedBills.splice(existingId, 1);
						responseCombinedBills.push(existing);
					}
				});
				setBills(responseCombinedBills);
			}
		};
		fetchBills(monthsDisplayed);
	}, [monthsDisplayed]);

	return (
		<div className="box">
			<div className="tabs is-fullwidth">
				<ul>
					<li
						onClick={() => setSelectedGraph("Costs")}
						className={selectedGraph === "Costs" ? "is-active" : ""}
					>
						<a>Costs</a>
					</li>
					<li
						onClick={() => setSelectedGraph("Usage")}
						className={selectedGraph === "Usage" ? "is-active" : ""}
					>
						<a>Usage</a>
					</li>
					<li
						onClick={() => setSelectedGraph("kWh Rate")}
						className={selectedGraph === "kWh Rate" ? "is-active" : ""}
					>
						<a>kWh Rate</a>
					</li>
					<li
						onClick={() => setSelectedGraph("Standing order charges")}
						className={
							selectedGraph === "Standing order charges" ? "is-active" : ""
						}
					>
						<a>Standing charges</a>
					</li>
				</ul>
			</div>

			{selectedGraph === "Costs" && (
				<>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<p className="title is-4">Costs in Pounds</p>

						<Selector
							possibleValues={[6, 12, 18, 24]}
							initialValue={monthsDisplayed}
							supplementary="Months"
							onSelectHandler={setMonthsDisplayed}
						/>
					</div>
					<p>
						Including tax. Based on usage and rate - not including any reduction
						schemes like{" "}
						<a href="https://octopus.energy/blog/energy-price-cap-oct-2022/">
							Energy price guarantee
						</a>{" "}
						or{" "}
						<a href="https://www.gov.uk/guidance/energy-bills-discount-scheme">
							Govt energy discount scheme
						</a>{" "}
					</p>
					<ResponsiveContainer width="100%" height={400} className="mb-3">
						<AreaChart
							data={mapForBillData()}
							margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="Date" />
							<YAxis />
							<Tooltip />
							<Area
								type="monotone"
								dataKey="Gas"
								stroke="#2d5ff7"
								fill="#7396ff"
							/>
							<Area
								type="monotone"
								dataKey="Electric"
								stroke="#fabf34"
								fill="#fadc34"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</>
			)}
			{selectedGraph === "Usage" && (
				<>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<p className="title is-4">Usage in kWh</p>
						<Selector
							possibleValues={[6, 12, 18, 24]}
							initialValue={monthsDisplayed}
							supplementary="Months"
							onSelectHandler={setMonthsDisplayed}
						/>
					</div>
					<p>
						Data points are taken at billing date time and <b>not</b> from the
						smart metre. Gas is recorded in m³ and conversion might not always
						be accurate.
					</p>
					<ResponsiveContainer width="100%" height={400} className="mb-3">
						<AreaChart
							data={mapForUsage()}
							margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="Date" />
							<YAxis />
							<Tooltip />
							<Area
								type="monotone"
								dataKey="Gas"
								stroke="#2d5ff7"
								fill="#7396ff"
							/>
							<Area
								type="monotone"
								dataKey="Electric"
								stroke="#fabf34"
								fill="#fadc34"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</>
			)}
			{selectedGraph === "kWh Rate" && (
				<>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<p className="title is-4">Price per kWh</p>
						<Selector
							possibleValues={[6, 12, 18, 24]}
							initialValue={monthsDisplayed}
							supplementary="Months"
							onSelectHandler={setMonthsDisplayed}
						/>
					</div>
					<p>
						Prices in pence. Does not account for price reduction schemes like{" "}
						<a href="https://octopus.energy/blog/energy-price-cap-oct-2022/">
							Energy price guarantee
						</a>{" "}
						or{" "}
						<a href="https://www.gov.uk/guidance/energy-bills-discount-scheme">
							Govt energy discount scheme
						</a>{" "}
					</p>
					<ResponsiveContainer width="100%" height={400} className="mb-3">
						<AreaChart
							data={mapForRate()}
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
				</>
			)}
			{selectedGraph === "Standing order charges" && (
				<>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<p className="title is-4">Daily standing order charges</p>
						<Selector
							possibleValues={[6, 12, 18, 24]}
							initialValue={monthsDisplayed}
							supplementary="Months"
							onSelectHandler={setMonthsDisplayed}
						/>
					</div>
					<p>Prices in pence.</p>
					<ResponsiveContainer width="100%" height={400} className="mb-3">
						<AreaChart
							data={mapForStandingCharge()}
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
				</>
			)}
			<p>
				Graphs omit billing periods that cover less than 20 days to avoid
				skewing the visualisations.
			</p>
			<hr />

			<p className="title is-3">Electricity</p>

			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "/energy/bills/add?type=electric", newTab: false }}
						title={"Add bill"}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "/energy/bills/history?type=electric", newTab: false }}
						title={"View billing history"}
					/>
				</div>
			</div>

			<p className="title is-3 pt-4">Gas</p>
			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "/energy/bills/add?type=gas", newTab: false }}
						title={"Add bill"}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "/energy/bills/history?type=gas", newTab: false }}
						title={"View billing history"}
					/>
				</div>
			</div>

			<div className="modal">
				<div className="modal-background"></div>
				<div className="modal-content"></div>
				<button className="modal-close is-large" aria-label="close"></button>
			</div>
		</div>
	);
}
