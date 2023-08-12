import { padLeft, toDate } from "@/utilities/formatting";

describe("padLeft", () => {
	it("Will pad number to 5 characters", () => {
		const output = padLeft(1, "0", 5);
		expect(output.length).toBe(5);
		expect(output).toBe("00001");
	});

	it("Will ignore if existing length is met", () => {
		const output = padLeft("long", "0", 2);
		expect(output.length).toBe(4);
		expect(output).toBe("long");
	});
});

describe("toDate", () => {
	it("Will create a new date from a string", () => {
		const out = toDate("2021-01-01");
		expect(out instanceof Date).toBe(true);
	});

	it("Will create a new date from a unix timestamp", () => {
		const out = toDate(1691864048);
		expect(out instanceof Date).toBe(true);
	});

	it("Will return the same date", () => {
		const input = new Date("2021-01-01");
		const out = toDate(input);
		expect(input).toEqual(out);
	});

	it("Will log to console if input is not valid", () => {
		const input = "not a date";
		console.error = jest.fn();

		toDate(input);
		expect(console.error).toHaveBeenCalled();
	});
});
