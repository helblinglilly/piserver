import config from "@/config";
import { WeeklyTimesheet } from "@/pages/timesheet";
import { minutesWorkedInDay } from "@/utilities/dateUtils";
import { useEffect, useState } from "react";

export default function WeeklyHourSummary({
	weeklySummary,
}: {
	weeklySummary: WeeklyTimesheet;
}) {
	const [difference, setDifference] = useState(0);

	useEffect(() => {
		let daysRecorded = 0;
		let minutesWorked = 0;
		if (weeklySummary.mon !== null) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.mon.clockIn,
				weeklySummary.mon.breaks,
				weeklySummary.mon.clockOut,
			);
		}
		if (weeklySummary.tue !== null) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.tue.clockIn,
				weeklySummary.tue.breaks,
				weeklySummary.tue.clockOut,
			);
		}
		if (weeklySummary.wed !== null) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.wed.clockIn,
				weeklySummary.wed.breaks,
				weeklySummary.wed.clockOut,
			);
		}
		if (weeklySummary.thu !== null) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.thu.clockIn,
				weeklySummary.thu.breaks,
				weeklySummary.thu.clockOut,
			);
		}
		if (weeklySummary.fri !== null) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.fri.clockIn,
				weeklySummary.fri.breaks,
				weeklySummary.fri.clockOut,
			);
		}

		const targetMinutes =
			(config.timesheet.hours * 60 + config.timesheet.minutes) * daysRecorded;

		setDifference(targetMinutes - minutesWorked);
	}, [setDifference, weeklySummary]);

	return (
		<p>
			{`${difference === 0 ? "Even" : difference > 0 ? "Owe: " : "Overtime: "}`}
			{Math.abs(difference) > 59
				? `${Math.floor(difference / 60)}h ${Math.abs(difference % 60)}min`
				: `${difference}min`}
		</p>
	);
}
