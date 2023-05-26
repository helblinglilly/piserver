import { toDayDDMM, toHHMM, toHHMMUTC } from "@/utilities/dateUtils";
import Notification from "@/components/Notification";
import React, { useRef, useState } from "react";

export default function Timesheet() {
	const [failureMessages] = useState<string[]>([]);

	const [currentTime, setCurrentTime] = useState(new Date());
	const [workedTime, setWorkedTime] = useState(new Date(0));

	const [clockIn, setClockIn] = useState<Date | undefined>();
	const [clockOut, setClockOut] = useState<Date | undefined>();

	interface IBreak {
		start: Date;
		end: Date | undefined;
	}
	const breakStartRef = useRef<HTMLButtonElement>();
	const breakEndRef = useRef<HTMLButtonElement>();
	const [breaks, setBreaks] = useState<IBreak[]>([]);

	setInterval(() => {
		const now = new Date();

		setCurrentTime(now);
		if (clockIn) {
			if (breaks.length === 0) {
				setWorkedTime(new Date(now.valueOf() - clockIn.valueOf()));
			} else {
				let accummulator = new Date(0);
				let previousBreakEnd: Date | undefined;
				breaks.forEach((breakEntry, i) => {
					// Time between clock in and initial break start
					if (i === 0) {
						accummulator = new Date(
							breakEntry.start.valueOf() - clockIn.valueOf()
						);
						previousBreakEnd = breakEntry.end;
					}

					if (i < breaks.length - 1 && previousBreakEnd !== undefined) {
						accummulator = new Date(
							breakEntry.start.valueOf() -
								previousBreakEnd.valueOf() +
								accummulator.valueOf()
						);
					} else if (
						// The last entry - add the difference between break end and now / clock out
						i === breaks.length - 1 &&
						previousBreakEnd !== undefined
					) {
						const lastWorkedTimestamp = clockOut ? clockOut : now;
						accummulator = new Date(
							lastWorkedTimestamp.valueOf() -
								previousBreakEnd.valueOf() +
								accummulator.valueOf()
						);
					}
				});

				setWorkedTime(accummulator);
			}
		}
	}, 1000 * 10);

	const actionButtonStyle = {
		minWidth: "9em",
	};

	const summaryTableCellStyle = {
		minWidth: "4em",
	};

	const onClockInHandle = (event: React.MouseEvent<HTMLButtonElement>) => {
		setClockIn(new Date());
		event.currentTarget.disabled = true;
	};

	const onBreakInHandle = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.currentTarget.disabled = true;
		setBreaks([...breaks, { start: new Date(), end: undefined }]);

		if (breakEndRef.current) breakEndRef.current.disabled = false;
	};

	const onBreakEndHandle = (event: React.MouseEvent<HTMLButtonElement>) => {
		const incompleteBreakEntry = breaks.filter(
			(breakEntries) => breakEntries.end === undefined
		)[0];
		const breakEntriesCopy = breaks.filter((entry) => entry.end !== undefined);

		incompleteBreakEntry.end = new Date();
		breakEntriesCopy.push(incompleteBreakEntry);
		setBreaks(breakEntriesCopy);

		event.currentTarget.disabled = true;
		if (breakStartRef.current) breakStartRef.current.disabled = false;
	};

	const onClockOutHandle = () => {
		setClockOut(new Date());
	};

	return (
		<>
			<Notification type="fail" message={failureMessages} />

			<p className="title is-3">{toDayDDMM(currentTime)}</p>

			<p className="title is-3">{toHHMM(currentTime)}</p>

			<div className="columns">
				<div className="column centerContent">
					<button
						className="button"
						style={actionButtonStyle}
						onClick={onClockInHandle}
						disabled={clockOut !== undefined}
					>
						Clock in
					</button>
				</div>
				<div className="column centerContent">
					<button
						className="button"
						onClick={onBreakInHandle}
						style={actionButtonStyle}
						disabled={clockOut !== undefined || clockIn === undefined}
						ref={breakStartRef as React.LegacyRef<HTMLButtonElement>}
					>
						Start break
					</button>
				</div>
				<div className="column centerContent">
					<button
						className="button"
						onClick={onBreakEndHandle}
						style={actionButtonStyle}
						disabled={clockOut !== undefined || clockIn === undefined}
						ref={breakEndRef as React.LegacyRef<HTMLButtonElement>}
					>
						End break
					</button>
				</div>
				<div className="column centerContent">
					<button
						className="button"
						style={actionButtonStyle}
						onClick={onClockOutHandle}
						disabled={clockOut !== undefined || clockIn === undefined}
					>
						Clock out
					</button>
				</div>
			</div>

			<hr />

			{!clockIn ? (
				<p className="title is-4">No entries yet</p>
			) : (
				<>
					<p className="title is-4 mb-2">Workday</p>
					<table className="ml-3">
						<tbody>
							<tr>
								<td style={summaryTableCellStyle}>{toHHMM(clockIn)}</td>
								<td>Day started</td>
							</tr>
							{breaks.length > 0 &&
								breaks.map((breakEntry, i) => {
									return (
										<>
											<tr key={`${i}-${breakEntry.start.toISOString()}`}>
												<td
													style={summaryTableCellStyle}
													key={`${i}-${breakEntry.start.toISOString()}-value`}
												>
													{toHHMM(breakEntry.start)}
												</td>
												<td
													key={`${i}-${breakEntry.start.toISOString()}-label`}
												>
													Break started
												</td>
											</tr>

											{breakEntry.end && (
												<tr key={`${i}-${breakEntry.start.toISOString()}-end`}>
													<td
														style={summaryTableCellStyle}
														key={`${i}-${breakEntry.start.toISOString()}-end-value`}
													>
														{toHHMM(breakEntry.end)}
													</td>
													<td
														key={`${i}-${breakEntry.start.toISOString()}-end-label`}
													>
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
									<b>{toHHMMUTC(workedTime)}</b>
								</td>
								<td>Worked</td>
							</tr>
						</tfoot>
					</table>
				</>
			)}

			<hr />

			<p className="title is-4">Week to date</p>
		</>
	);
}
