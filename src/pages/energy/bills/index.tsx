import React, { useEffect, useState } from "react";
import StandingChargeChart from "@/components/Energy/StandingChargeChart";
import RootAppCard from "@/components/rootAppCard";

export interface StandingCharges {
	standingCharge: number;
	endDate: Date;
	type: "electricity" | "gas";
}

interface APIResponse {
	standingCharges: StandingCharges[];
}
export default function EnergyBillsIndex() {
	const [standingCharges, setStandingCharges] = useState<StandingCharges[]>([]);

	useEffect(() => {
		const getChartData = async () => {
			const response = await fetch("/api/energy/bills");

			if (response.status !== 200) {
				return;
			}

			try {
				let body = (await response.json()) as APIResponse;
				const parsedStandingCharges = body.standingCharges.map((entry) => {
					return {
						standingCharge: entry.standingCharge,
						endDate: new Date(entry.endDate),
						type: entry.type,
					};
				}) as unknown as StandingCharges[];
				setStandingCharges(parsedStandingCharges);
			} catch (error) {
				return;
			}
		};

		getChartData();
	}, []);

	return (
		<>
			<div className="columns">
				<div className="column">
					<RootAppCard
						link={{ url: "/energy/bills/add", newTab: false }}
						title={"Add bill"}
					/>
				</div>
				<div className="column">
					<RootAppCard
						link={{ url: "/energy/bills/history", newTab: false }}
						title={"View history"}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column">
					<div className="card">
						<div
							className="card-header"
							style={{ cursor: "pointer" }}
							onClick={() => {
								const el = document.getElementById("standingChargeChart");
								if (el) {
									el.classList.toggle("is-hidden");
								}
							}}
						>
							<div className="card-header-title">
								<p>Standing Charges</p>
							</div>
						</div>
						<div
							className="card-content is-hidden"
							style={{ padding: "10px" }}
							id="standingChargeChart"
						>
							<StandingChargeChart standingCharges={standingCharges} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
