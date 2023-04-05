import React from "react";

interface DatePickerState {
	currentValue: Date;
	hasChanged: boolean;
}
export default class DatePicker extends React.Component<
	{
		// eslint-disable-next-line no-unused-vars
		changeHandler: (date: Date) => any;
		name: string;
		isReadOnly: boolean;
		initialDate: Date;
		minDate: Date;
		maxDate: Date;
	},
	DatePickerState
> {
	constructor(props: {
		// eslint-disable-next-line no-unused-vars
		changeHandler: (date: Date) => any;
		formName?: string;
		isReadOnly: boolean;
		initialDate: Date;
		minDate: Date;
		maxDate: Date;
	}) {
		super(props);
		this.state = {
			currentValue: this.props.initialDate,
			hasChanged: false,
		};
	}

	internalChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const date = new Date(e.target.value);
		try {
			date.toISOString();
		} catch (e) {
			return;
		}

		this.setState({
			currentValue: date,
			hasChanged: true,
		});
		this.props.changeHandler(date);
	};

	render() {
		return (
			<input
				className="input"
				type="date"
				id={`${this.props.name}-date`}
				name={this.props.name ? this.props.name : ""}
				onChange={this.internalChangeHandler}
				min={this.props.minDate.toISOString().split("T")[0]}
				max={this.props.maxDate.toISOString().split("T")[0]}
				value={
					this.state.hasChanged
						? this.state.currentValue.toISOString().split("T")[0]
						: this.props.initialDate.toISOString().split("T")[0]
				}
				disabled={this.props.isReadOnly}
				required
			/>
		);
	}
}
