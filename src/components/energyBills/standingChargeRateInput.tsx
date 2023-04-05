import React from "react";

export default class StandingChargeRateInput extends React.Component<
	{
		// eslint-disable-next-line no-unused-vars
		changeHandler: (e: React.ChangeEvent<HTMLInputElement>) => any;
		formName: string;
		initialValue: number;
		initialIsDefault?: boolean;
	},
	{
		initialValue: number;
	}
> {
	constructor(props: {
		changeHandler: () => any;
		formName: string;
		initialValue: number;
		initialIsDefault?: boolean;
	}) {
		super(props);
		this.state = {
			initialValue: this.props.initialValue,
		};
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
								onChange={this.props.changeHandler}
								placeholder={`${this.state.initialValue} p/day`}
								required
							/>
						</p>
					</div>
				</div>
				<div className="field-label is-normal">
					<label className="label">p/day</label>
				</div>
			</div>
		);
	}
}
