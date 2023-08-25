import Log from "@/log";
import React, { useState } from "react";

interface DatePickerProps {
	changeHandler: (_a: Date) => void;
	name?: string | undefined;
	isReadOnly?: boolean;
	initialDate: Date;
	minDate: Date;
	maxDate: Date;
}

export default function DatePicker({
	name = "datePicker",
	isReadOnly = false,
	changeHandler,
	initialDate,
	minDate,
	maxDate,
}: DatePickerProps) {
	const [currentValue, setCurrentValue] = useState(initialDate);
	const [hasChanged, setHasChanged] = useState(false);

	const internalChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const date = new Date(e.target.value);
		try {
			date.toISOString();
		} catch {
			Log.error(
				`Tried to change date to ${e.target.value} which is not a valid date`,
			);
			return;
		}

		setHasChanged(true);
		setCurrentValue(date);

		changeHandler(date);
	};

	return (
		<input
			className="input"
			type="date"
			id={`${name}-date`}
			name={name ? name : ""}
			onChange={internalChangeHandler}
			min={minDate.toISOString().split("T")[0]}
			max={maxDate.toISOString().split("T")[0]}
			value={
				hasChanged
					? currentValue.toISOString().split("T")[0]
					: initialDate.toISOString().split("T")[0]
			}
			disabled={isReadOnly}
			required
		/>
	);
}
