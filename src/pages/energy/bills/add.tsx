import React, { useEffect, useState } from "react";
import DatePicker from "@/components/DatePicker";
import BillInput from "@/components/Energy/BillInput";
import { daysBetweenDates } from "@/utilities/dateUtils";
import { validateBillInputFE } from "@/utilities/energyUtils";
import { useRouter } from "next/router";
import { useNotification } from "@/contexts/Notification";

export default function EnergyBillAdd() {
	const router = useRouter();
	const { addNotification } = useNotification();

	const [lastBillEndDate, setLastBillEndDate] = useState<Date | undefined>();
	const [startDate, setStartDate] = useState<Date | undefined>();
	const [endDate, setEndDate] = useState(new Date());
	const [standingChargeDays, setStandingChargeDays] = useState(0);

	const [electricityUsage, setElectricityUsage] = useState(0);
	const [electricityRate, setElectricityRate] = useState(0);
	const [electricityStandingChargeRate, setElectricityStandingChargeRate] =
		useState(0);
	const [electricityCost, setElectricityCost] = useState<number | undefined>();
	const [electricityCharged, setElectricityCharged] = useState<
	number | undefined
	>();

	const [gasUsage, setGasUsage] = useState(0);
	const [gasRate, setGasRate] = useState(0);
	const [gasStandingChargeRate, setGasStandingChargeRate] = useState(0);
	const [gasCost, setGasCost] = useState<number | undefined>();
	const [gasCharged, setGasCharged] = useState<number | undefined>();

	useEffect(() => {
		if (startDate) {
			setStandingChargeDays(daysBetweenDates(startDate, endDate) + 1);
		}
	}, [startDate, endDate]);

	useEffect(() => {
		const fetchLatestBillEndDate = async () => {
			const result = await fetch("/api/energy/bills/latest");

			if (result.status !== 200) {
				addNotification({ message: `Failed to fetch latest bill end date - ${result.status}`, type: "error" });
				return;
			}
			const body = await result.json();

			const date = new Date(body.date);
			date.setDate(date.getDate() + 1);
			setLastBillEndDate(date);
			setStartDate(date);
		};

		fetchLatestBillEndDate();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const submitBill = async () => {
		if (!startDate) {
			return;
		}

		try {
			const response = await fetch("/api/energy/bills", {
				method: "POST",
				body: JSON.stringify({
					gas: {
						energyType: "gas",
						startDate: startDate.toISOString(),
						endDate: endDate.toISOString(),
						usage: gasUsage,
						usageRate: gasRate,
						standingCharge: gasStandingChargeRate,
						cost: gasCost,
						charged: gasCharged,
					},
					electricity: {
						energyType: "electricity",
						startDate: startDate.toISOString(),
						endDate: endDate.toISOString(),
						usage: electricityUsage,
						usageRate: electricityRate,
						standingCharge: electricityStandingChargeRate,
						cost: electricityCost,
						charged: electricityCharged,
					},
				}),
			});
			if (response.status !== 200) {
				throw new Error("Failed to submit bill.");
			}
			addNotification({ message: "Bill has been added", type: "success" });
			setTimeout(() => {
				router.push("/energy/bills");
			}, 2000);
		} catch (err) {
			addNotification({ message: "Failed to submit bill.", type: "error" });
		}
	};

	const handleSubmitClick = async () => {
		const { isValid, messages } = validateBillInputFE(
			standingChargeDays,
			electricityUsage,
			electricityRate,
			electricityStandingChargeRate,
			electricityCharged,
			electricityCost,
			gasUsage,
			gasRate,
			gasStandingChargeRate,
			gasCost,
			gasCharged,
		);

		if (!isValid) {
			addNotification({ message: `Bill is in an invalid state - ${messages}`, type: "error" });
			return;
		}

		await submitBill();
	};

	return (
		<>
			<p className="title is-4">Dates</p>

			<div className="columns">
				<div className="column">
					<label className="label">Start date</label>
					{lastBillEndDate && startDate ? (
						<DatePicker
							changeHandler={(date) => {
								setStartDate(date);
							}}
							name={"startDate"}
							initialDate={startDate}
							minDate={lastBillEndDate}
							maxDate={endDate}
						/>
					) : (
						<input className="input loading" type="date" />
					)}
				</div>
				<div className="column">
					<label className="label">End date</label>
					{lastBillEndDate && startDate ? (
						<DatePicker
							changeHandler={(date) => {
								setEndDate(date);
							}}
							name={"endDate"}
							initialDate={endDate}
							minDate={startDate}
							maxDate={new Date()}
						/>
					) : (
						<input className="input loading" type="date" />
					)}
				</div>
				<div className="column">
					<label className="label">Standing charge days</label>
					{lastBillEndDate ? (
						<input
							className="input"
							type="number"
							value={standingChargeDays}
							disabled
							readOnly
						/>
					) : (
						<input className="input loading" type="date" />
					)}
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
			/>

			<button
				className="button is-info"
				style={{ width: "100%", marginTop: "20px" }}
				onClick={handleSubmitClick}
			>
				Submit
			</button>
		</>
	);
}
