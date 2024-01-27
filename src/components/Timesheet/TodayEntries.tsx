import { TodaysTimesheet } from "@/pages/timesheet";
import { minutesWorkedInDay, toHHMM } from "@/utilities/dateUtils";
import leftPad from "@/utilities/formatting";
import { Fragment } from "react";

const TodaysEntries = ({ clockIn, breaks, clockOut }: TodaysTimesheet) => {
	const summaryTableCellStyle = {
		minWidth: "4em",
	};

	return (
		<>
			{clockIn ? (
				<>
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
				</>
			) : (
				<p className="title is-4">No entries yet</p>
			)}
		</>
	);
};

export default TodaysEntries;
