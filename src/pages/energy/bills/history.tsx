import React from "react";
import BillSummary from "@/components/Energy/BillSummary";
import { EnergyBillRow, getAllBills } from "@/db/EnergyBill";
import Link from "next/link";

export default function EnergyBillHistory({
	energyBills,
}: {
	energyBills: { electric: EnergyBillRow; gas: EnergyBillRow }[];
}) {
	return (
		<>
			{energyBills.length === 0 && (
				<div style={{ display: "inline-flex" }}>
					<p>
						There are no energy bills recorded yet. You can add some{" "}
						<Link href="/energy/bills/add">here</Link>
					</p>
				</div>
			)}
			{energyBills.map((energyBill, i) => {
				return (
					<div
						key={`${energyBill.electric.startDate}-${i}}`}
						style={{ marginBottom: "25px" }}
					>
						<BillSummary
							electricityBill={energyBill.electric}
							gasBill={energyBill.gas}
							isHidden={energyBills.length > 1}
						/>
					</div>
				);
			})}
		</>
	);
}

export const getServerSideProps = async () => {
	interface TransmittableEnergyBillRow
		extends Omit<EnergyBillRow, "startDate" | "endDate"> {
		startDate: string;
		endDate: string;
	}
	const allBills = await getAllBills();
	const sortedBills = allBills.sort((a, b) =>
		a.startDate < b.startDate ? 1 : -1,
	);
	const groupedBills: {
		electric: TransmittableEnergyBillRow;
		gas: TransmittableEnergyBillRow;
	}[] = [];

	let previousBill: TransmittableEnergyBillRow | undefined;
	sortedBills.forEach((bill) => {
		const parsedBill = {
			energyType: bill.energyType,
			startDate: bill.startDate.toISOString(),
			endDate: bill.endDate.toISOString(),
			usage: Number(bill.usage),
			usageRate: Number(bill.usageRate),
			standingCharge: Number(bill.standingCharge),
			cost: Number(bill.cost),
			charged: Number(bill.charged),
		};
		if (!previousBill) {
			previousBill = parsedBill;
			return;
		}
		if (previousBill.energyType === "electricity") {
			groupedBills.push({
				electric: previousBill,
				gas: parsedBill,
			});
			previousBill = undefined;
		} else {
			groupedBills.push({
				electric: parsedBill,
				gas: previousBill,
			});
			previousBill = undefined;
		}
	});

	return {
		props: {
			energyBills: groupedBills,
		},
	};
};
