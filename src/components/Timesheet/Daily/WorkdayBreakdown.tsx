import React from "react";
import { minutesWorkedInDay, toHHMM } from "@/utilities/dateUtils";
import leftPad from "@/utilities/formatting";
import { Fragment } from "react";
import useTimesheet from "@/hooks/useDailyTimesheet";

const WorkdayBreakdown = () => {
	const { clockIn, breaks, clockOut } = useTimesheet().timesheet;

	if (!clockIn) {
		return <p className="title is-4">No entries yet</p>;
	}
	return (
		<table className="ml-3 ">
			<tbody>
				<tr>
					<td className="timesheetWorkdayBreakdown">{toHHMM(clockIn)}</td>
					<td>Day started</td>
				</tr>
				{breaks.map((breakEntry, i) => {
					return (
						<Fragment key={i}>
							<tr>
								<td className="timesheetWorkdayBreakdown">
									{toHHMM(breakEntry.breakIn)}
								</td>
								<td>Break started</td>
							</tr>

							{breakEntry.breakOut && (
								<tr key={`${i}-break-out`}>
									<td className="timesheetWorkdayBreakdown">
										{toHHMM(breakEntry.breakOut)}
									</td>
									<td>Break ended</td>
								</tr>
							)}
						</Fragment>
					);
				})}
				{clockOut && (
					<tr>
						<td className="timesheetWorkdayBreakdown">{toHHMM(clockOut)}</td>
						<td>Day ended</td>
					</tr>
				)}
			</tbody>
			<tfoot>
				<tr>
					<td className="timesheetWorkdayBreakdown">
						<b>
							{leftPad(
								Math.floor(minutesWorkedInDay(clockIn, breaks, clockOut) / 60),
								2,
								"0",
							)}
							:{leftPad(minutesWorkedInDay(clockIn, breaks, clockOut) % 60, 2, "0")}
						</b>
					</td>
					<td>Worked</td>
				</tr>
			</tfoot>
		</table>
	);
};

export default WorkdayBreakdown;
