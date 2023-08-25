import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DatePicker from "../DatePicker";
import "@testing-library/jest-dom";

const minDate = new Date("2010-01-01");
const initialDate = new Date("2015-01-01");
const maxDate = new Date("2020-01-01");

it("Will display the initial date", () => {
	render(
		<DatePicker
			changeHandler={() => null}
			minDate={minDate}
			maxDate={maxDate}
			initialDate={initialDate}
		/>,
	);

	expect(screen.getByDisplayValue(/2015-01-01/i)).toBeInTheDocument();
});

describe("When changing values", () => {
	it("Will change the display value", () => {
		render(
			<DatePicker
				changeHandler={() => null}
				minDate={minDate}
				maxDate={maxDate}
				initialDate={initialDate}
			/>,
		);

		const datePicker = screen.getByDisplayValue(/2015-01-01/i);

		fireEvent.change(datePicker, { target: { value: "2019-01-01" } });

		expect(screen.getByDisplayValue(/2019-01-01/i)).toBeInTheDocument();
	});

	it("Will call the callback method with the new date value", () => {
		const mockChangeHandler = jest.fn();

		render(
			<DatePicker
				changeHandler={mockChangeHandler}
				minDate={minDate}
				maxDate={maxDate}
				initialDate={initialDate}
			/>,
		);

		const datePicker = screen.getByDisplayValue(/2015-01-01/i);

		fireEvent.change(datePicker, { target: { value: "2019-01-01" } });

		expect(mockChangeHandler).toHaveBeenCalledWith(new Date("2019-01-01"));
	});
});
