import React from "react";
import useTimesheet, { TimesheetActions } from "@/hooks/useDailyTimesheet";

export default function TimesheetActionButtons() {
	const { timesheet, recordEntry, mostRecentBreak } = useTimesheet();

	return (
		<div className="columns">
			<div className="column centerContent">
				<button
					className="button timesheetActionButton"
					disabled={!!timesheet.clockIn}
					onClick={() => recordEntry(TimesheetActions.clockIn)}
				>
					Clock in
				</button>
			</div>
			<div className="column centerContent">
				<button
					className="button timesheetActionButton"
					disabled={
						(timesheet.clockOut ? true : false) ||
						(timesheet.clockIn ? false : true) ||
						(mostRecentBreak ? !mostRecentBreak.breakOut : false)
					}
					onClick={() => recordEntry(TimesheetActions.breakIn)}
				>
					Start break
				</button>
			</div>
			<div className="column centerContent">
				<button
					className="button timesheetActionButton"
					disabled={
						(timesheet.clockOut ? true : false) ||
						(timesheet.clockIn ? false : true) ||
						(mostRecentBreak ? !!mostRecentBreak.breakOut : false)
					}
					onClick={() => recordEntry(TimesheetActions.breakOut)}
				>
					End break
				</button>
			</div>
			<div className="column centerContent">
				<button
					className="button timesheetActionButton"
					disabled={!!timesheet.clockOut || !timesheet.clockIn}
					onClick={() => recordEntry(TimesheetActions.clockOut)}
				>
					Clock out
				</button>
			</div>
		</div>
	);
}
