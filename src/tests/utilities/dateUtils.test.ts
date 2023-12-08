import {
	addMinutesToDate,
	daysBetweenDates,
	getPreviousMonday,
	minutesBetweenDates,
	minutesWorkedInDay,
	toDayDDMM,
	toDayHHMM,
	toHHMM,
	toHHMMUTC,
	toMidnightUTC,
} from "@/utilities/dateUtils";

describe("toDayHHMM", () => {
	const date = new Date("2020-01-01T00:00:00.000Z");
	it("Will parse date correctly", () => {
		const out = toDayHHMM(date);
		expect(out).toBe("Wednesday, 00:00");
	});
});

describe("toDayDDMM", () => {
	const date = new Date("2020-01-01T00:00:00.000Z");
	it("Will parse date correctly", () => {
		const out = toDayDDMM(date);
		expect(out).toBe("Wednesday, 1 January");
	});
});

describe("toHHMM", () => {
	it("Will return the correct time", () => {
		const date = new Date("2020-01-01T13:42:00.000Z");
		const out = toHHMM(date);
		expect(out).toBe("13:42");
	});

	it("Will pad to always fit to 2 characters", () => {
		const date = new Date("2020-01-01T09:05:00.000Z");
		const out = toHHMM(date);
		expect(out).toBe("09:05");
	});
});

describe("toHHMMUTC", () => {
	it("Will return the correct time", () => {
		const date = new Date("2020-01-01T13:42:00.000+02:00");
		const out = toHHMMUTC(date);
		expect(out).toBe("11:42");
	});

	it("Will pad to always fit to 2 characters", () => {
		const date = new Date("2020-01-01T09:05:00.000+02:00");
		const out = toHHMMUTC(date);
		expect(out).toBe("07:05");
	});
});

describe("toMidnightUTC", () => {
	it("Will not modify the original input", () => {
		const original = new Date("2020-01-01:10:00:00.000+00:00");
		toMidnightUTC(original);
		expect(original.getHours()).toBe(10);
	});

	it("Will set the time to midnight UTC", () => {
		const input = new Date("2020-01-01:10:00:00.000+00:00");
		const out = toMidnightUTC(input);
		expect(out.getUTCHours()).toBe(0);
	});
});

describe("daysBetweenDates", () => {
	it("Behaves like >= in accordance with Octopus standing charges - ignores time", () => {
		const a = new Date("2020-01-01T09:00:00.000Z");
		const b = new Date("2020-01-03T00:00:00.000Z");
		const out = daysBetweenDates(a, b);
		expect(out).toBe(2);
	});
});

describe("getPreviousMonday", () => {
	it("Will not modify the original input", () => {
		const original = new Date("2020-01-01T10:00:00.000+00:00");
		getPreviousMonday(original);
		expect(original).toEqual(new Date("2020-01-01T10:00:00.000+00:00"));
	});

	it("Will return the previous Monday (Wednesday)", () => {
		const input = new Date("2023-08-09");
		const out = getPreviousMonday(input);
		expect(out).toEqual(new Date("2023-08-07"));
	});

	it("Will return the current date if it's Monday", () => {
		const input = new Date("2023-08-07");
		const out = getPreviousMonday(input);
		expect(out).toEqual(new Date("2023-08-07"));
	});

	it("Will return the current date if it's Sunday", () => {
		const input = new Date("2023-08-06");
		const out = getPreviousMonday(input);
		expect(out).toEqual(new Date("2023-07-31"));
	});
});

describe("minutesBetweenDates", () => {
	it("Will return the right amount of minutes", () => {
		const a = new Date("2023-08-01T09:00:00.000Z");
		const b = new Date("2023-08-01T09:30:00.000Z");
		const out = minutesBetweenDates(a, b);
		expect(out).toBe(30);
	});
});

describe("minutesWorkedInDay", () => {
	it("Will return 0 if day not started yet", () => {
		const output = minutesWorkedInDay(null, null, null);
		expect(output).toBe(0);
	});

	it("Will return the live amount if only clocked in", () => {
		jest.useFakeTimers().setSystemTime(new Date("2020-01-01T09:30:00.000Z"));
		const output = minutesWorkedInDay(
			new Date("2020-01-01T09:00:00.000Z"),
			null,
			null,
		);
		expect(output).toBe(30);
	});

	it("Can deal with no breaks having been taken", () => {
		const output = minutesWorkedInDay(
			new Date("2020-01-01T09:00:00.000Z"),
			null,
			new Date("2020-01-01T09:30:00.000Z"),
		);
		expect(output).toBe(30);
	});

	it("Will account for currently being on break", () => {
		const output = minutesWorkedInDay(
			new Date("2020-01-01T09:00:00.000Z"),
			[
				{
					breakIn: new Date("2020-01-01T12:00:00.000Z"),
					breakOut: null,
				},
			],
			null,
		);
		expect(output).toBe(180);
	});

	it("Will return the live amount after break has been taken", () => {
		jest.useFakeTimers().setSystemTime(new Date("2020-01-01T15:30:00.000Z"));
		const output = minutesWorkedInDay(
			new Date("2020-01-01T09:00:00.000Z"),
			[
				{
					breakIn: new Date("2020-01-01T12:00:00.000Z"),
					breakOut: new Date("2020-01-01T13:00:00.000Z"),
				},
			],
			null,
		);
		expect(output).toBe(330);
	});

	it("Will report correctly for a completed day", () => {
		const output = minutesWorkedInDay(
			new Date("2020-01-01T09:00:00.000Z"),
			[
				{
					breakIn: new Date("2020-01-01T12:00:00.000Z"),
					breakOut: new Date("2020-01-01T13:00:00.000Z"),
				},
			],
			new Date("2020-01-01T17:00:00.000Z"),
		);
		expect(output).toBe(420);
	});
});

describe("addMinutesToDate", () => {
	it("Will not modify the input", () => {
		const input = new Date("2020-01-01:10:00:00.000+00:00");
		addMinutesToDate(input, 15);
		expect(input.getMinutes()).toBe(0);
	});

	it("Will return a correct new date", () => {
		const input = new Date("2020-01-01:10:00:00.000+00:00");
		const output = addMinutesToDate(input, 15);
		expect(output).toEqual(new Date("2020-01-01:10:15:00.000+00:00"));
	});
});
