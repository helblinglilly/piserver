import DatePicker from "@/components/datePicker";
import StandingChargeDaysInput from "@/components/energyBills/standingChargeDaysInput";
import StandingChargeRateInput from "@/components/energyBills/standingChargeRateInput";
import { EnergyBillPayload } from "@/pages/api/energy/bill";
import { energy_bill } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function EnergyBillsAdd() {
	const params = useSearchParams();
	const { push } = useRouter();

	const type = params.get("type")?.toLowerCase();

	const isGas = type === "gas";

	useEffect(() => {
		if (!type || !["gas", "electric"].includes(type)) {
			push("/energy/bills");
		}

		const getLatestBill = async () => {
			let response = await fetch(
				`/api/energy/bill?endDate=${new Date().toISOString()}&type=${
					isGas ? "gas" : "electric"
				}&limit=1`
			);
			if (response.status === 200) {
				const responseBill = (await response.json()) as energy_bill[];
				const lastBill = responseBill[0];
				setLastBillEndDate(new Date(lastBill.billing_end));
				setBillingDateStart(new Date(lastBill.billing_end));
				setStandingChargeDays(
					daysBetweenDates(new Date(lastBill.billing_end), new Date())
				);

				lastStandingCharge.current = Number(lastBill.standing_order_rate);
				lastUsage.current = Number(lastBill.usage_kwh);
				lastRate.current = Number(lastBill.rate_kwh);
			}
		};
		getLatestBill();
	}, [isGas, push, type]);

	function daysBetweenDates(date1: Date, date2: Date): number {
		return Math.abs(
			Math.round((date1.valueOf() - date2.valueOf()) / (1000 * 60 * 60 * 24))
		);
	}

	const lastStandingCharge = useRef<number>(45.96);
	const lastUsage = useRef<number>(89.51);
	const lastRate = useRef<number>(26.06);
	const standingChargeRate = useRef<number>(0);
	const [lastBillEndDate, setLastBillEndDate] = useState(new Date(0));
	const [billingDateStart, setBillingDateStart] = useState(new Date(0));
	const [billingDateEnd, setBillingDateEnd] = useState(new Date());
	const [standingChargeDays, setStandingChargeDays] = useState(
		daysBetweenDates(billingDateStart, billingDateEnd)
	);

	const [kwhUsage, setKwhUsage] = useState(0.0);
	const [kwhRate, setKwhRate] = useState(0.0);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState<string[]>([]);

	const onBillingStartChange = (newDate: Date) => {
		setBillingDateStart(newDate);
		setStandingChargeDays(daysBetweenDates(newDate, billingDateEnd));
	};

	const onBillingEndChange = (newDate: Date) => {
		setBillingDateEnd(newDate);
		setStandingChargeDays(daysBetweenDates(billingDateStart, newDate));
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const payload: EnergyBillPayload = {
			billType: isGas ? "gas" : "electric",
			startDate: billingDateStart,
			endDate: billingDateEnd,
			standingChargeDays: standingChargeDays,
			standingChargeRate: standingChargeRate.current,
			kwhUsage: kwhUsage,
			kwhRate: kwhRate,
		};

		const result = await fetch("/api/energy/bill", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (result.status === 201) {
			setErrorMessage([]);
			setSuccessMessage(`Bill has been added successfully!`);
		} else if (result.status === 409) {
			setSuccessMessage("");
			setErrorMessage(
				errorMessage.concat([
					`A${
						isGas ? " Gas" : "n Electricity"
					} bill for the same time period already exists.`,
				])
			);
		} else if (result.status === 400) {
			const issue = await result.json();
			setErrorMessage(issue.errors);
		}

		document.getElementById("navbar")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<p className="title is-3" id="pageTitle">
				Add {isGas ? "Gas" : "Electricity"} Bill
			</p>
			<div
				className="notification is-success"
				style={successMessage.length > 0 ? {} : { display: "none" }}
			>
				{successMessage}
			</div>

			<div
				className="notification is-danger"
				style={errorMessage.length > 0 ? {} : { display: "none" }}
			>
				{errorMessage.map((message, i) => {
					return <p key={`error-${i}`}>{message}</p>;
				})}
			</div>
			<form id="data" onSubmit={handleSubmit}>
				<input
					name="type"
					value={isGas ? "gas" : "electricity"}
					hidden
					readOnly
				/>
				{/* Start and End dates */}
				<div className="columns">
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Billing Start</div>
							<div className="card-content">
								<DatePicker
									changeHandler={onBillingStartChange}
									name="start_date"
									initialDate={lastBillEndDate}
									minDate={lastBillEndDate}
									maxDate={billingDateEnd}
									isReadOnly={false}
								/>
							</div>
						</div>
					</div>

					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Billing End</div>
							<div className="card-content">
								<DatePicker
									changeHandler={onBillingEndChange}
									name="end_date"
									initialDate={new Date()}
									minDate={billingDateStart}
									maxDate={new Date()}
									isReadOnly={false}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Standing charge */}
				<div className="columns">
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Standing Charge Days</div>
							<div className="card-content">
								<StandingChargeDaysInput
									changeHandler={(e) => {
										setStandingChargeDays(Number(e.target.value));
									}}
									formName="standing_charge_days"
									initialValue={0}
									value={standingChargeDays}
								/>
							</div>
						</div>
					</div>
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Standing Charge Rate</div>
							<div className="card-content">
								<StandingChargeRateInput
									changeHandler={(e) =>
										(standingChargeRate.current = Number(e.target.value))
									}
									formName="standing_charge_rate"
									initialValue={lastStandingCharge.current}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* kWh usage*/}
				<div className="columns">
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">kWh Used</div>
							<div className="card-content">
								<div className="field is-horizontal">
									<div className="field-body">
										<div className="field">
											<p className="control">
												<input
													className="input"
													id="units_used"
													type="number"
													name="units_used"
													step="0.01"
													placeholder={`${lastUsage.current} kWh`}
													onChange={(e) => setKwhUsage(Number(e.target.value))}
													required
												/>
											</p>
										</div>
									</div>
									<div className="field-label is-normal">
										<label className="label">kWh</label>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">kWh Rate</div>
							<div className="card-content">
								<div className="field is-horizontal">
									<div className="field-body">
										<div className="field">
											<p className="control">
												<input
													className="input"
													id="unit_price"
													type="number"
													name="unit_price"
													step="0.01"
													placeholder={`${lastRate.current} p/kWh`}
													onChange={(e) => setKwhRate(Number(e.target.value))}
													required
												/>
											</p>
										</div>
									</div>
									<div className="field-label is-normal">
										<label className="label">p/kWh</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<button
					type="submit"
					className="button is-fullwidth is-primary"
					id="submit_button"
				>
					Submit
				</button>
			</form>
		</>
	);
}
