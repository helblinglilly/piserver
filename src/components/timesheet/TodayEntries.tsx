import { TodaysTimesheet } from "@/pages/timesheet";
import { minutesWorkedInDay, toHHMM } from "@/utilities/dateUtils";
import leftPad from "@/utilities/formatting";

export default function TodaysEntries ({clockIn, breaks, clockOut}: TodaysTimesheet) {
  const summaryTableCellStyle = {
		minWidth: "4em",
	};

  return <>
  {clockIn ? (
				<>
					<p className="title is-4 mb-2">Workday</p>
					<table className="ml-3">
						<tbody>
							<tr>
								<td style={summaryTableCellStyle}>{toHHMM(clockIn)}</td>
								<td>Day started</td>
							</tr>
							{breaks && breaks.map((breakEntry, i) => {
								return (
									<>
										<tr key={`breakIn-${i}-${breakEntry.breakIn.toISOString()}-${i}`}>
											<td
												style={summaryTableCellStyle}
												key={`breakIn-${i}-${breakEntry.breakIn.toISOString()}-${i}-value`}
											>
												{toHHMM(breakEntry.breakIn)}
											</td>
											<td key={`breakIn-${i}-${breakEntry.breakIn.toISOString()}-${i}-label`}>
												Break started
											</td>
										</tr>

										{breakEntry.breakOut && (
											<tr key={`breakEnd-${i}-${breakEntry.breakOut.toISOString()}-${i}-end`}>
												<td
													style={summaryTableCellStyle}
													key={`breakEnd-${i}-${breakEntry.breakOut.toISOString()}-${i}-end-value`}
												>
													{toHHMM(breakEntry.breakOut)}
												</td>
												<td key={`breakEnd-${i}-${breakEntry.breakIn.toISOString()}-${i}-end-label`}>
													Break ended
												</td>
											</tr>
										)}
									</>
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
									<b>{leftPad(Math.floor(minutesWorkedInDay(clockIn, breaks, clockOut ) / 60), 2, "0")}:{leftPad(minutesWorkedInDay(clockIn, breaks, clockOut ) % 60, 2, "0")}</b>
								</td>
								<td>Worked</td>
							</tr>
						</tfoot>
					</table>
				</>
			) : <p className="title is-4">No entries yet</p>}</>
}