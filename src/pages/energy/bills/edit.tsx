import { getBillByDate } from "@/db/EnergyBill";
import { GetServerSidePropsContext } from "next";
import Notification from "@/components/Notification";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BillInput from "@/components/Energy/BillInput";
import DatePicker from "@/components/DatePicker";
import config from "@/config";
import { daysBetweenDates } from "@/utilities/dateUtils";
import { validateBillInput } from "@/utilities/energyUtils";
import { toDate } from "@/utilities/formatting";

interface IBillWeb {
	charged: number;
	cost: number;
	endDate: string;
	startDate: string;
	energyType: "electricity" | "gas";
	standingCharge: number;
	usage: number;
	usageRate: number;
}

export default function EnergyBillEdit({
	bills,
	moveInDate,
}: {
	bills: { electricity: IBillWeb | undefined; gas: IBillWeb | undefined };
	moveInDate: string;
}) {
	const router = useRouter();
	const [successMessages, setSuccessMessages] = useState<string[]>([]);
	const [failureMessages, setFailureMessages] = useState<string[]>([]);

	const [electricityUsage, setElectricityUsage] = useState(
		bills.electricity ? bills.electricity.usage : 0,
	);
	const [electricityRate, setElectricityRate] = useState(
		bills.electricity ? bills.electricity.usageRate : 0,
	);
	const [electricityStandingChargeRate, setElectricityStandingChargeRate] =
		useState(bills.electricity ? bills.electricity.standingCharge : 0);
	const [electricityCost, setElectricityCost] = useState(
		bills.electricity ? bills.electricity.cost : 0,
	);
	const [electricityCharged, setElectricityCharged] = useState(
		bills.electricity ? bills.electricity.charged : 0,
	);
	const [gasUsage, setGasUsage] = useState(bills.gas ? bills.gas.usage : 0);
	const [gasRate, setGasRate] = useState(bills.gas ? bills.gas.usageRate : 0);
	const [gasStandingChargeRate, setGasStandingChargeRate] = useState(
		bills.gas ? bills.gas.standingCharge : 0,
	);
	const [gasCost, setGasCost] = useState(bills.gas ? bills.gas.cost : 0);
	const [gasCharged, setGasCharged] = useState(
		bills.gas ? bills.gas.charged : 0,
	);

	const getExistingStartDate = () => {
		if (bills.electricity) {
			return toDate(bills.electricity.startDate);
		} else if (bills.gas) {
			return toDate(bills.gas.startDate);
		}
		return new Date();
	};

	const getExistingEndDate = () => {
		if (bills.electricity) {
			return toDate(bills.electricity.endDate);
		} else if (bills.gas) {
			return toDate(bills.gas.endDate);
		}
		return new Date();
	};

	const [newStartDate, setNewStartDate] = useState(getExistingStartDate());
	const [newEndDate, setNewEndDate] = useState(getExistingEndDate());
	const [standingChargeDays, setStandingChargeDays] = useState(
		daysBetweenDates(newStartDate, newEndDate),
	);

	useEffect(() => {
		setStandingChargeDays(daysBetweenDates(newStartDate, newEndDate));
	}, [newStartDate, newEndDate]);

	const submitBill = async () => {
		try {
			const response = await fetch("/api/energy/bills", {
				method: "PATCH",
				body: JSON.stringify({
					originalBills: {
						startDate: getExistingStartDate().toISOString(),
						endDate: getExistingEndDate().toISOString(),
					},
					newBills: {
						gas: {
							energyType: "gas",
							startDate: newStartDate.toISOString().split("T")[0],
							endDate: newEndDate.toISOString().split("T")[0],
							usage: gasUsage,
							usageRate: gasRate,
							standingCharge: gasStandingChargeRate,
							cost: gasCost,
							charged: gasCharged,
						},
						electricity: {
							energyType: "electricity",
							startDate: newStartDate.toISOString().split("T")[0],
							endDate: newEndDate.toISOString().split("T")[0],
							usage: electricityUsage,
							usageRate: electricityRate,
							standingCharge: electricityStandingChargeRate,
							cost: electricityCost,
							charged: electricityCharged,
						},
					},
				}),
			});
			if (response.status !== 200) {
				throw new Error("Failed to update bill.");
			}
			setSuccessMessages([...successMessages, "Bill has been updated"]);
			setTimeout(() => {
				router.push("/energy/bills/history");
			}, 2000);
		} catch (err) {
			setFailureMessages([...failureMessages, "Failed to update bill."]);
		}
	};

	const handleSubmitClick = async () => {
		const electricityValidation = validateBillInput({
			type: "Electricity",
			usage: electricityUsage,
			rate: electricityRate,
			standingChargeDays: daysBetweenDates(newStartDate, newEndDate),
			standingChargeRate: electricityStandingChargeRate,
			cost: electricityCost,
			charged: electricityCharged,
		});

		const gasValidation = validateBillInput({
			type: "Gas",
			usage: gasUsage,
			rate: gasRate,
			standingChargeDays: daysBetweenDates(newStartDate, newEndDate),
			standingChargeRate: gasStandingChargeRate,
			cost: gasCost,
			charged: gasCharged,
		},
		);

		if (!(electricityValidation.isValid && gasValidation.isValid)) {
			setFailureMessages([...electricityValidation.messages, ...gasValidation.messages]);
			return;
		}

		await submitBill();
	};

	return (
		<>
			<Notification message={successMessages} type="success" />
			<Notification message={failureMessages} type="fail" />

			<p className="title is-4">Dates</p>

			<div className="columns">
				<div className="column">
					<label className="label">Start date</label>
					<DatePicker
						changeHandler={setNewStartDate}
						name={"startDate"}
						initialDate={getExistingStartDate()}
						minDate={toDate(moveInDate)}
						maxDate={new Date()}
					/>
				</div>
				<div className="column">
					<label className="label">End date</label>
					<DatePicker
						changeHandler={setNewEndDate}
						name={"endDate"}
						initialDate={getExistingEndDate()}
						minDate={toDate(moveInDate)}
						maxDate={new Date()}
					/>
				</div>
				<div className="column">
					<label className="label">Standing charge days</label>
					<input
						className="input"
						type="number"
						value={standingChargeDays}
						disabled
						readOnly
					/>
				</div>
			</div>

			<hr />

			<p className="title is-4">Electric</p>

			<BillInput
				setUsage={setElectricityUsage}
				setRate={setElectricityRate}
				setStandingChargeRate={setElectricityStandingChargeRate}
				setCost={setElectricityCost}
				setCharged={setElectricityCharged}
				usage={electricityUsage}
				rate={electricityRate}
				standingChargeRate={electricityStandingChargeRate}
				cost={electricityCost}
				standingChargeDays={standingChargeDays}
				charged={electricityCharged}
			/>
			<hr />

			<p className="title is-4">Gas</p>

			<BillInput
				setUsage={setGasUsage}
				setRate={setGasRate}
				setStandingChargeRate={setGasStandingChargeRate}
				setCost={setGasCost}
				setCharged={setGasCharged}
				usage={gasUsage}
				rate={gasRate}
				standingChargeRate={gasStandingChargeRate}
				cost={gasCost}
				standingChargeDays={standingChargeDays}
				charged={gasCharged}
			/>

			<button
				className="button is-info"
				style={{ width: "100%", marginTop: "20px" }}
				onClick={handleSubmitClick}
			>
				Update
			</button>
		</>
	);
}

export const getServerSideProps = async (
	context: GetServerSidePropsContext,
) => {
	let startDate = context.query.startDate;
	let endDate = context.query.endDate;

	const emptyProps = {
		props: {
			bill: null,
		},
	};

	if (!startDate || !endDate) {
		return emptyProps;
	}

	let startDateDate = new Date(0);
	let endDateDate = new Date(0);

	try {
		startDateDate = new Date(startDate.toString());
		endDateDate = new Date(endDate.toString());
	} catch (e) {
		return emptyProps;
	}

	const bills = await getBillByDate(startDateDate, endDateDate);
	const parsed = bills.map((entry) => {
		return {
			charged: Number(entry.charged),
			cost: Number(entry.cost),
			endDate: entry.endDate.toISOString(),
			startDate: entry.startDate.toISOString(),
			energyType: entry.energyType,
			standingCharge: Number(entry.standingCharge),
			usage: Number(entry.usage),
			usageRate: Number(entry.usageRate),
		};
	});

	return {
		props: {
			bills: {
				electricity: parsed.find((bill) => bill.energyType === "electricity"),
				gas: parsed.find((bill) => bill.energyType === "gas"),
			},
			moveInDate: config.energy.moveInDate.toISOString(),
		},
	};
};
