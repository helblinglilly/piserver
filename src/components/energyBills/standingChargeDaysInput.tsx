import React from "react";

export default class StandingChargeDaysInput extends React.Component<{
	// eslint-disable-next-line no-unused-vars
	changeHandler: (e: React.ChangeEvent<HTMLInputElement>) => any;
	formName: string;
	initialValue: number;
	value: number;
}> {
	constructor(props: {
		changeHandler: () => any;
		formName: string;
		initialValue: number;
		value: number;
	}) {
		super(props);
	}
	render() {
		return (
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
								value={this.props.value}
								onChange={this.props.changeHandler}
								placeholder={`${this.props.initialValue} p/day`}
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
		);
	}
}
