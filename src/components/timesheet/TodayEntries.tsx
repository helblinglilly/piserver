import { TodaysTimesheet } from "@/pages/timesheet";
import { minutesWorkedInDay, toHHMM } from "@/utilities/dateUtils";
import { padLeft } from "@/utilities/formatting";
import { Fragment } from "react";

export default function TodaysEntries({
	clockIn,
	breaks,
	clockOut,
}: TodaysTimesheet) {
	const summaryTableCellStyle = {
		minWidth: "4em",
	};

	return (
		<>
			{clockIn ? (
				<>
					<p className="title is-4 mb-2">Workday</p>
					<table className="ml-3">
						<tbody>
							<tr>
								<td style={summaryTableCellStyle}>{toHHMM(clockIn)}</td>
								<td>Day started</td>
							</tr>
							{breaks?.map((breakEntry, i) => {
								return (
									<Fragment key={i}>
										<tr>
											<td style={summaryTableCellStyle}>{toHHMM(breakEntry.breakIn)}</td>
											<td>Break started</td>
										</tr>

										{breakEntry.breakOut && (
											<tr key={`${i}-break-out`}>
												<td style={summaryTableCellStyle}>{toHHMM(breakEntry.breakOut)}</td>
												<td>Break ended</td>
											</tr>
										)}
									</Fragment>
								);
							})}
							{clockOut && (
								<tr>
									<td style={summaryTableCellStyle}>{toHHMM(clockOut)}</td>
									<td>Day ended</td>
								</tr>
							)}
						</tbody>
						<tfoot>
							<tr>
								<td style={summaryTableCellStyle}>
									<b>
										{padLeft(
											Math.floor(minutesWorkedInDay(clockIn, breaks, clockOut) / 60),
											"0",
											2,
										)}
										:{padLeft(minutesWorkedInDay(clockIn, breaks, clockOut) % 60, "0", 2)}
									</b>
								</td>
								<td>Worked</td>
							</tr>
						</tfoot>
					</table>
				</>
			) : (
				<p className="title is-4">No entries yet</p>
			)}
		</>
	);
}
