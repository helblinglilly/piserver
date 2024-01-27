import config from "@/config";
import { IWeeklyResponse } from "@/pages/api/timesheet";
import { minutesWorkedInDay } from "@/utilities/dateUtils";
import { useEffect, useState } from "react";

const WeeklyHourSummary = ({
	weeklySummary,
}: {
	weeklySummary: IWeeklyResponse;
}) => {
	const [difference, setDifference] = useState(0);

	useEffect(() => {
		let daysRecorded = 0;
		let minutesWorked = 0;
		if (weeklySummary.mon.timesheet) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.mon.timesheet.clockIn,
				weeklySummary.mon.timesheet.breaks,
				weeklySummary.mon.timesheet.clockOut,
			);
		}
		if (weeklySummary.tue.timesheet) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.tue.timesheet.clockIn,
				weeklySummary.tue.timesheet.breaks,
				weeklySummary.tue.timesheet.clockOut,
			);
		}
		if (weeklySummary.wed.timesheet) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.wed.timesheet.clockIn,
				weeklySummary.wed.timesheet.breaks,
				weeklySummary.wed.timesheet.clockOut,
			);
		}
		if (weeklySummary.thu.timesheet) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.thu.timesheet.clockIn,
				weeklySummary.thu.timesheet.breaks,
				weeklySummary.thu.timesheet.clockOut,
			);
		}
		if (weeklySummary.fri.timesheet) {
			daysRecorded++;
			minutesWorked += minutesWorkedInDay(
				weeklySummary.fri.timesheet.clockIn,
				weeklySummary.fri.timesheet.breaks,
				weeklySummary.fri.timesheet.clockOut,
			);
		}

		const targetMinutes =
			(config.timesheet.hours * 60 + config.timesheet.minutes) * daysRecorded;

		setDifference(targetMinutes - minutesWorked);
	}, [setDifference, weeklySummary]);

	return (
		<p>
			{`${difference === 0 ? "Even: " : difference > 0 ? "Owe: " : "Overtime: "}`}
			{Math.abs(difference) > 59
				? `${Math.floor(difference / 60)}h ${Math.abs(difference % 60)}min`
				: `${Math.abs(difference)}min`}
		</p>
	);
};

export default WeeklyHourSummary;
