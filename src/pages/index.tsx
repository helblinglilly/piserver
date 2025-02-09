import useTime from "@/hooks/useTime";
import { toDayDDMM, toHHMM } from "@/utilities/dateUtils";
import React from "react";
import TimesheetActionButtons from "../components/Timesheet/Daily/ActionButtons";
import PredictedFinish from "../components/Timesheet/Daily/PredictedFinish";
import WorkdayBreakdown from "../components/Timesheet/Daily/WorkdayBreakdown";
import Link from "next/link";

export default function Timesheet() {
	const currentTime = useTime();

	return (
		<>
			<p className="title is-3">{toDayDDMM(new Date())}</p>
			<p className="title is-3">{toHHMM(currentTime)}</p>

			<TimesheetActionButtons />

			<hr />

			<div className="columns">
				<div className="column">
					<PredictedFinish />
				</div>
			</div>

			<hr />

			<p className="title is-4 mb-2">Workday</p>
			<WorkdayBreakdown />

			<hr />

			<button className="button" type="button">
				<Link href="/weekly">Weekly view</Link>
			</button>
		</>
	);
}
