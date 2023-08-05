/* eslint-disable no-unused-vars */
import { useEffect } from "react";

export default function BillInput({
	setUsage,
	setRate,
	setStandingChargeRate,
	setCost,
	setCharged,
	usage,
	rate,
	standingChargeRate,
	cost,
	standingChargeDays,
	charged,
}: {
	setUsage: (_a: number) => void;
	setRate: (_a: number) => void;
	setStandingChargeRate: (_a: number) => void;
	setCost: (_a: number) => void;
	setCharged: (_a: number) => void;
	usage: number;
	rate: number;
	standingChargeRate: number;
	cost: number | undefined;
	standingChargeDays: number;
	charged?: number | undefined;
}) {
	useEffect(() => {
		if (usage > 0 && rate > 0 && standingChargeRate > 0) {
			setCost(
				Number(
					Number(
						(usage * rate + standingChargeDays * standingChargeRate) / 100,
					).toFixed(2),
				),
			);
		}
	}, [usage, rate, standingChargeRate, standingChargeDays, setCost]);

	return (
		<>
			<div className="columns">
				<div className="column">
					<label className="label">Usage</label>
					<input
						className="input"
						type="number"
						placeholder="kWh"
						step={0.01}
						min={0.0}
						max={10000.0}
						onChange={(e) => {
							setUsage(Number(e.currentTarget.value));
						}}
						defaultValue={usage ? usage : ""}
					/>
				</div>

				<div className="column">
					<label className="label">Rate</label>
					<input
						className="input"
						type="number"
						placeholder="p/kWh"
						step={0.01}
						min={0.0}
						max={10000.0}
						onChange={(e) => {
							setRate(Number(e.currentTarget.value));
						}}
						defaultValue={rate ? rate : ""}
					/>
				</div>

				<div className="column">
					<label className="label">Standing charge rate</label>
					<input
						className="input"
						type="number"
						placeholder="p/day"
						step={0.01}
						min={0.0}
						max={10000.0}
						onChange={(e) => {
							setStandingChargeRate(Number(e.currentTarget.value));
						}}
						defaultValue={standingChargeRate ? standingChargeRate : ""}
					/>
				</div>
			</div>

			<div className="columns">
				<div className="column" />
				<div className="column">
					<label className="label">Cost</label>
					<input
						className="input"
						type="text"
						placeholder="£"
						readOnly
						disabled
						value={usage > 0 && rate > 0 && standingChargeRate > 0 ? cost : ""}
					/>
				</div>

				<div className="column">
					<label className="label">Charged</label>
					<input
						className="input"
						type="number"
						placeholder="£"
						step={0.01}
						onChange={(e) => {
							setCharged(Number(e.currentTarget.value));
						}}
						defaultValue={charged ? charged : ""}
					/>
				</div>
			</div>
		</>
	);
}
