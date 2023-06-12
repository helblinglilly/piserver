// import DatePicker from "@/components/DatePicker";
import { EnergyBillPayload } from "@/pages/api/energy/bill";
import { energy_bill } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function EnergyBillsEdit() {
	const params = useSearchParams();
	let type = params.get("type")?.toLowerCase();
	const isGas = type === "gas";

	const { push } = useRouter();

	const [successMessage, setSuccessMessage] = useState("");
	const [warningMessage, setWarningMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState<string[]>([]);

	const [startDate, setStartDate] = useState(new Date(0));
	const [endDate, setEndDate] = useState(new Date(0));
	const standingChargeDays = useRef<number>(0.0);
	const standingChargeRate = useRef<number>(0.0);
	const usage = useRef<number>(0.0);
	const rate = useRef<number>(0.0);

	const oldStandingChargeRate = useRef<number>(0.0);
	const oldUsage = useRef<number>(0.0);
	const oldRate = useRef<number>(0.0);

	const isLoaded = useRef<boolean>(false);

	useEffect(() => {
		if (!type || !["gas", "electric"].includes(type)) {
			push("/energy/bills");
		}

		const fetchBill = async () => {
			let response = await fetch(
				`/api/energy/bill?type=${
					isGas ? "gas" : "electric"
				}&startDate=${params.get("startDate")}&limit=1`
			);

			if (response.status === 200) {
				const repsonseBill = (await response.json()) as energy_bill[];
				const bill = repsonseBill[0];
				setStartDate(new Date(bill.billing_start));
				setEndDate(new Date(bill.billing_end));
				standingChargeDays.current = bill.standing_order_charge_days;
				standingChargeRate.current = Number(bill.standing_order_rate);
				usage.current = Number(bill.usage_kwh);
				rate.current = Number(bill.rate_kwh);
				oldStandingChargeRate.current = Number(bill.standing_order_rate);
				oldUsage.current = Number(bill.usage_kwh);
				oldRate.current = Number(bill.rate_kwh);
			} else if (response.status === 204) {
				setWarningMessage("Bill could not be found");
			}
			isLoaded.current = true;
		};

		fetchBill();
	}, [isGas, params, push, type]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const payload: EnergyBillPayload = {
			billType: isGas ? "gas" : "electric",
			startDate: startDate,
			endDate: endDate,
			standingChargeDays: standingChargeDays.current,
			standingChargeRate: standingChargeRate.current,
			kwhUsage: usage.current,
			kwhRate: rate.current,
		};

		const result = await fetch("/api/energy/bill", {
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (result.status === 200) {
			setErrorMessage([]);
			setSuccessMessage(`Bill has been updated successfully!`);
		} else if (result.status === 404) {
			setSuccessMessage("");
			setErrorMessage(["The bill could no longer be found!"]);
		} else if (result.status === 400) {
			const issue = await result.json();
			setErrorMessage(issue.errors);
		} else {
			setErrorMessage(["Internal Server Error - Something went wrong"]);
		}

		document.getElementById("navbar")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<p className="title is-3">Edit {isGas ? "Gas" : "Electricity"} Bill</p>
			<div
				className="notification is-success"
				style={successMessage.length > 0 ? {} : { display: "none" }}
			>
				{successMessage}
			</div>
			<div
				className="notification is-warning"
				style={warningMessage.length > 0 ? {} : { display: "none" }}
			>
				{warningMessage}
			</div>
			<div
				className="notification is-error"
				style={errorMessage.length > 0 ? {} : { display: "none" }}
			>
				{errorMessage}
			</div>

			<form id="data" onSubmit={handleSubmit}>
				<input
					name="type"
					value={isGas ? "gas" : "electricity"}
					hidden
					readOnly
				/>
				<div className="columns">
					{/* Start Date */}
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Billing Start</div>
							<div className="card-content">
								{/*<DatePicker
									changeHandler={() => {}}
									name="start_date"
									initialDate={startDate}
									minDate={startDate}
									maxDate={startDate}
									isReadOnly={true}
								/>*/}
								<p>Date Picker</p>
							</div>
						</div>
					</div>
					{/* End Date */}
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Billing End</div>
							<div className="card-content">
								{/*<DatePicker
									changeHandler={() => {}}
									name="end_date"
									initialDate={endDate}
									minDate={endDate}
									maxDate={endDate}
									isReadOnly={true}
								/>*/}
							</div>
						</div>
					</div>
				</div>
				<div className="columns">
					{/* Standing charge */}
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Standing Charge Days</div>
							<div className="card-content">
								{/* <StandingChargeDaysInput
									changeHandler={(e) => {
										standingChargeDays.current = Number(e.target.value);
									}}
									formName="standing_charge_days"
									initialValue={0}
									value={standingChargeDays.current}
								/> */}
							</div>
						</div>
					</div>
					{/* Standing charge rate */}
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Standing Charge Rate</div>
							<div className="card-content">
								<div className="field is-horizontal">
									<div className="field-body">
										<div className="field">
											<p className="control">
												<input
													className="input"
													id="standing_charge_rate"
													type="number"
													name="standing_charge_rate"
													step="0.01"
													onChange={(e) =>
														(standingChargeRate.current = Number(
															e.target.value
														))
													}
													placeholder={`${oldStandingChargeRate.current} p/day`}
													required
												/>
											</p>
										</div>
									</div>
									<div className="field-label is-normal">
										<label className="label">p/day</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="columns">
					{/* kwh Usage */}
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
													placeholder={`${oldUsage.current} kWh`}
													onChange={(e) =>
														(usage.current = Number(e.target.value))
													}
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
						{/* kwh Rate */}
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
													placeholder={`${oldRate.current} p/kWh`}
													onChange={(e) =>
														(rate.current = Number(e.target.value))
													}
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
					Update
				</button>
			</form>
		</>
	);
}
