import React, { useRef } from "react";
import { EnergyBill } from "@/db/EnergyBill";
import { daysBetweenDates } from "@/utilities/dateUtils";
import Link from "next/link";

export default function BillSummary({
	electricityBill,
	gasBill,
	isHidden,
}: {
	electricityBill: EnergyBill;
	gasBill: EnergyBill;
	isHidden?: boolean;
}) {
	const cardContentRef = useRef<HTMLDivElement>(null);

	const handleTitleClick = () => {
		if (cardContentRef.current !== null) {
			cardContentRef.current.classList.toggle("is-hidden");
		}
	};
	return (
		<div className="card">
			<div className="card-header">
				<div className="card-header-title" onClick={handleTitleClick}>
					{new Date(electricityBill.startDate).toLocaleDateString("en-GB")} -{" "}
					{new Date(electricityBill.endDate).toLocaleDateString("en-GB")}
					<Link
						href={`/energy/bills/edit?startDate=${new Date(electricityBill.startDate).toISOString().split("T")[0]
							}&endDate=${new Date(electricityBill.endDate).toISOString().split("T")[0]
							}`}
						style={{ marginLeft: "auto" }}
					>
						<button className="button">Edit</button>
					</Link>
				</div>
			</div>
			<div
				className={`card-content ${isHidden ? "is-hidden" : ""}`}
				ref={cardContentRef}
			>
				<p className="title is-5">Electricity</p>
				<div className="columns">
					<div className="column">Energy used</div>
					<div className="column">
						{electricityBill.usage} kWh @ {electricityBill.usageRate}p/kWh
					</div>
				</div>

				<div className="columns">
					<div className="column">Standing charges</div>
					<div className="column">
						{daysBetweenDates(
							new Date(electricityBill.startDate),
							new Date(electricityBill.endDate),
						)}{" "}
						days @ {electricityBill.standingCharge}p/day
					</div>
				</div>

				<div className="columns">
					<div className="column">Before charges: £{electricityBill.cost}</div>
					<div className="column">After charges: £{electricityBill.charged}</div>
				</div>

				<p className="title is-5">Gas</p>
				<div className="columns">
					<div className="column">Energy used</div>
					<div className="column">
						{gasBill.usage} kWh @ {gasBill.usageRate}p/kWh
					</div>
				</div>

				<div className="columns">
					<div className="column">Standing charges</div>
					<div className="column">
						{daysBetweenDates(new Date(gasBill.startDate), new Date(gasBill.endDate))}{" "}
						days @ {gasBill.standingCharge}p/day
					</div>
				</div>

				<div className="columns">
					<div className="column">Before charges: £{gasBill.cost}</div>
					<div className="column">After charges: £{gasBill.charged}</div>
				</div>
			</div>
		</div>
	);
}
