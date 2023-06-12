import Notification from "@/components/Notification";
// import DatePicker from "@/components/DatePicker";
import { useEffect, useRef, useState } from "react";
import { energy_bill } from "@prisma/client";

export default function EnergyBillsAdd() {
	const [successMessage] = useState<string[]>([]);
	const [errorMessage] = useState<string[]>([]);

	const lastGasStandingCharge = useRef(0.0);
	const gasStandingCharge = useRef(0.0);
	const lastGasUsage = useRef(0.0);
	const gasUsage = useRef(0.0);
	const lastGasRate = useRef(0.0);
	const gasRate = useRef(0.0);

	const lastElectricStandingCharge = useRef(0.0);
	const electricStandingCharge = useRef(0.0);
	const lastElectricUsage = useRef(0.0);
	const electricUsage = useRef(0.0);
	const lastElectricRate = useRef(0.0);
	const electricRate = useRef(0.0);

	const daysBetweenDates = (date1: Date, date2: Date): number => {
		return Math.abs(
			Math.ceil((date1.valueOf() - date2.valueOf()) / (1000 * 60 * 60 * 24))
		);
	};

	const [lastBillEndDate, setLastBillEndDate] = useState(new Date(0));
	const [billingDateStart, setBillingDateStart] = useState(new Date(0));
	const [billingDateEnd, setBillingDateEnd] = useState(new Date());
	const [standingChargeDays, setStandingChargeDays] = useState(
		daysBetweenDates(billingDateStart, billingDateEnd)
	);
	console.log(lastBillEndDate);

	useEffect(() => {
		const setElectricValues = (bill: energy_bill) => {
			lastElectricStandingCharge.current = Number(bill.standing_order_rate);
			electricStandingCharge.current = Number(bill.standing_order_rate);
			lastElectricUsage.current = Number(bill.usage_kwh);
			lastElectricRate.current = Number(bill.rate_kwh);
		};

		const setGasValues = (bill: energy_bill) => {
			lastGasStandingCharge.current = Number(bill.standing_order_rate);
			gasStandingCharge.current = Number(bill.standing_order_rate);
			lastGasUsage.current = Number(bill.usage_kwh);
			lastGasRate.current = Number(bill.rate_kwh);
		};

		const getLatestBill = async () => {
			let response = await fetch(
				`/api/energy/bill?endDate=${new Date().toISOString()}&limit=1`
			);
			if (response.status === 200) {
				const responseBill = (await response.json()) as energy_bill[];

				const gasBill = responseBill.filter((bill) => bill.is_gas)[0];
				const electricBill = responseBill.filter((bill) => bill.is_electric)[0];

				if (gasBill && electricBill) {
					const lastBillEndDate = new Date(
						Math.min(
							new Date(gasBill.billing_end).valueOf(),
							new Date(electricBill.billing_end).valueOf()
						)
					);
					setLastBillEndDate(lastBillEndDate);
					setBillingDateStart(lastBillEndDate);
					setElectricValues(electricBill);
					setGasValues(gasBill);
					setStandingChargeDays(
						daysBetweenDates(lastBillEndDate, billingDateEnd)
					);
				} else if (!gasBill && electricBill) {
					setLastBillEndDate(new Date(electricBill.billing_end));
					setBillingDateStart(new Date(electricBill.billing_end));
					setElectricValues(electricBill);
					setStandingChargeDays(
						daysBetweenDates(electricBill.billing_end, billingDateEnd)
					);
				} else if (gasBill && !electricBill) {
					setLastBillEndDate(new Date(gasBill.billing_end));
					setBillingDateStart(new Date(gasBill.billing_end));
					setGasValues(gasBill);
					setStandingChargeDays(
						daysBetweenDates(gasBill.billing_end, billingDateEnd)
					);
				}
			}
		};
		getLatestBill();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = () => {};
	/*
	const onBillingStartChange = (newDate: Date) => {
		setBillingDateStart(newDate);
		setStandingChargeDays(daysBetweenDates(newDate, billingDateEnd));
	};

	const onBillingEndChange = (newDate: Date) => {
		setBillingDateEnd(newDate);
		setStandingChargeDays(daysBetweenDates(billingDateStart, newDate));
	};
	*/
	setBillingDateEnd(new Date(0));
	return (
		<>
			<p className="title is-3">Add Bill</p>

			<Notification type="success" message={successMessage} />
			<Notification type="fail" message={errorMessage} />

			<p className="title is-5">Overview</p>

			<form id="data" onSubmit={handleSubmit}>
				<div className="columns">
					{/* Billing start date */}
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Billing Start</div>
							<div className="card-content">
								{/*<DatePicker
									changeHandler={onBillingStartChange}
									name="start_date"
									initialDate={lastBillEndDate}
									minDate={lastBillEndDate}
									maxDate={billingDateEnd}
									isReadOnly={false}
								/>*/}
								<p>Date Picker</p>
							</div>
						</div>
					</div>

					{/* Billing Date End */}
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Billing End</div>
							<div className="card-content">
								{/*<DatePicker
									changeHandler={onBillingEndChange}
									name="end_date"
									initialDate={new Date()}
									minDate={billingDateStart}
									maxDate={new Date()}
									isReadOnly={false}
								/>*/}
								<p>Date Picker</p>
							</div>
						</div>
					</div>

					{/* Standing Charge Days */}
					<div className="column is-flex">
						<div className="card" style={{ width: "100%" }}>
							<div className="card-header-title">Standing Charge Days</div>
							<div className="card-content">
								<div className="field is-horizontal">
									<div className="field-body">
										<div className="field">
											<p className="control">
												<input
													className="input"
													id="standing_charge_days"
													type="number"
													name="standing_charge_days"
													step="0.01"
													value={standingChargeDays}
													required
													readOnly
													disabled
												/>
											</p>
										</div>
									</div>
									<div className="field-label is-normal">
										<label className="label">days</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<p className="title is-5">Electricity</p>
				<div className="columns">
					{/* standing charge rate */}
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
														(electricStandingCharge.current = Number(
															e.target.value
														))
													}
													placeholder={`${lastElectricStandingCharge.current} p/day`}
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

					{/* kwh usage */}
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
													placeholder={`${lastElectricUsage.current} kWh`}
													onChange={(e) =>
														(electricUsage.current = Number(e.target.value))
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

					{/* kwh rate */}
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
													placeholder={`${lastElectricRate.current} p/kWh`}
													onChange={(e) =>
														(electricRate.current = Number(e.target.value))
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

				<p className="title is-5">Gas</p>
				<div className="columns">
					{/* standing charge rate */}
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
														(gasStandingCharge.current = Number(e.target.value))
													}
													placeholder={`${lastGasStandingCharge.current} p/day`}
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

					{/* kwh usage */}
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
													placeholder={`${lastGasUsage.current} kWh`}
													onChange={(e) =>
														(gasUsage.current = Number(e.target.value))
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

					{/* kwh rate */}
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
													placeholder={`${lastGasRate.current} p/kWh`}
													onChange={(e) =>
														(gasRate.current = Number(e.target.value))
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
			</form>
		</>
	);
}
