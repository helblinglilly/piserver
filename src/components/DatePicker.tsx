import React, { useState } from "react";

export default function DatePicker(props: {
	changeHandler: (_a: Date) => void;
	name: string;
	isReadOnly?: boolean;
	initialDate: Date;
	minDate: Date;
	maxDate: Date;
}) {
	const [currentValue, setCurrentValue] = useState(props.initialDate);
	const [hasChanged, setHasChanged] = useState(false);

	const internalChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const date = new Date(e.target.value);
		try {
			date.toISOString();
		} catch {
			return;
		}

		setHasChanged(true);
		setCurrentValue(date);

		props.changeHandler(date);
	};

	return (
		<input
			className="input"
			type="date"
			id={`${props.name}-date`}
			name={props.name ? props.name : ""}
			onChange={internalChangeHandler}
			min={props.minDate.toISOString().split("T")[0]}
			max={props.maxDate.toISOString().split("T")[0]}
			value={
				hasChanged
					? currentValue.toISOString().split("T")[0]
					: props.initialDate.toISOString().split("T")[0]
			}
			disabled={props.isReadOnly}
			required
		/>
	);
}
