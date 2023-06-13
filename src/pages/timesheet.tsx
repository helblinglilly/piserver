import { toDayDDMM, toHHMM, toHHMMUTC } from "@/utilities/dateUtils";
import Notification from "@/components/Notification";
import React, { useEffect, useRef, useState } from "react";
import { ITimesheetDay } from "@/data/TimesheetData";
// import { ITimesheetDay } from "@/data/TimesheetData";

interface IBreak {
	break_in: Date;
	break_out: Date | undefined | null;
}

export default function Timesheet() {
	const [failureMessages, setFailureMessages] = useState<string[]>([]);

	const [currentTime, setCurrentTime] = useState(new Date());
	const [workedTime, setWorkedTime] = useState(new Date(0));

	const [clockIn, setClockIn] = useState<Date | undefined>();
	const [breaks, setBreaks] = useState<IBreak[]>([]);
	const [clockOut, setClockOut] = useState<Date | undefined>();

	const [predictedClockout, setPredictedClockout] = useState<
		Date | undefined
	>();

	const clockInRef = useRef<HTMLButtonElement>();
	const breakStartRef = useRef<HTMLButtonElement>();
	const breakEndRef = useRef<HTMLButtonElement>();
	const clockOutRef = useRef<HTMLButtonElement>();

	const fetchData = async () => {
		const response = await fetch(
			`/api/timesheet?username=admin&date=${currentTime.toISOString()}`,
			{}
		);
		if (!response.body || response.status === 204) return;

		const body = (await response.json()) as ITimesheetDay;

		if (body.clock_in) {
			setClockIn(new Date(body.clock_in));
			if (clockInRef.current) {
				clockInRef.current.disabled = true;
			}
		}

		const existingBreaks: IBreak[] = [];

		if (body.timesheet_breaks) {
			let isOnBreak = false;

			body.timesheet_breaks
				.sort((a, b) => (a.break_in < b.break_in ? -1 : 1))
				.forEach((entry) => {
					isOnBreak = entry.break_out === null;
					if (entry.break_in && entry.break_out) {
						existingBreaks.push({
							break_in: new Date(entry.break_in),
							break_out: new Date(entry.break_out),
						});
					} else if (entry.break_in) {
						existingBreaks.push({
							break_in: new Date(entry.break_in),
							break_out: undefined,
						});
					}
				});

			setBreaks(existingBreaks);

			if (breakEndRef.current && breakStartRef.current) {
				breakStartRef.current.disabled = isOnBreak;
				breakEndRef.current.disabled = !isOnBreak;
			}
		}

		if (body.clock_out) {
			setClockOut(new Date(body.clock_out));
			[
				clockInRef.current,
				breakStartRef.current,
				breakEndRef.current,
				clockOutRef.current,
			].forEach((ref) => {
				if (ref) {
					ref.disabled = true;
				}
			});
		}

		calculateAndSetWorkedTime(
			currentTime,
			new Date(body.clock_in),
			existingBreaks,
			body.clock_out ? new Date(body.clock_out) : undefined
		);
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		updatePredictedClockOut(breaks);
	}, [breaks, workedTime]);

	const calculateAndSetWorkedTime = (
		currentTime: Date,
		clockIn: Date,
		breaks: IBreak[],
		clockOut: Date | undefined
	) => {
		if (!clockIn) {
			return;
		}

		if (breaks.length === 0) {
			setWorkedTime(new Date(currentTime.valueOf() - clockIn.valueOf()));
			return;
		}

		let accummulator = new Date(0);
		let previousBreakEnd: Date | undefined | null;

		breaks.forEach((breakEntry, i) => {
			if (i === 0) {
				accummulator = new Date(
					breakEntry.break_in.valueOf() - clockIn.valueOf()
				);
				previousBreakEnd = breakEntry.break_out;
			}

			if (
				i < breaks.length - 1 &&
				!(previousBreakEnd === undefined || previousBreakEnd === null)
			) {
				accummulator = new Date(
					breakEntry.break_in.valueOf() -
						previousBreakEnd.valueOf() +
						accummulator.valueOf()
				);
			} else if (
				// The last entry - add the difference between break end and now / clock out
				i === breaks.length - 1 &&
				!(previousBreakEnd === undefined || previousBreakEnd === null)
			) {
				const lastWorkedTimestamp = clockOut ? clockOut : currentTime;
				accummulator = new Date(
					lastWorkedTimestamp.valueOf() -
						previousBreakEnd.valueOf() +
						accummulator.valueOf()
				);
			}
		});
		setWorkedTime(accummulator);
	};

	const updatePredictedClockOut = (breakOverride?: IBreak[]) => {
		if (!clockIn) return;
		// Assume that 1h has been spent on break
		let hoursToWork = 8;
		let minutesToWork = 30;

		const breakToCheck = breakOverride ? breakOverride : breaks;
		if (breakToCheck.length > 0) {
			// Set to the actual amount of hours that need to be worked
			hoursToWork = 7;
		}

		const hoursLeft = hoursToWork - workedTime.getUTCHours();
		const minutesLeft = minutesToWork - workedTime.getUTCMinutes();

		console.log(`${workedTime.getUTCHours()}h${workedTime.getUTCMinutes()}min`);

		const predictedClockout = new Date(currentTime);
		predictedClockout.setHours(predictedClockout.getHours() + hoursLeft);
		predictedClockout.setMinutes(predictedClockout.getMinutes() + minutesLeft);
		predictedClockout.setSeconds(0);
		predictedClockout.setMilliseconds(0);

		setPredictedClockout(predictedClockout);
	};

	setInterval(() => {
		const now = new Date();
		setCurrentTime(now);

		if (clockIn) {
			calculateAndSetWorkedTime(now, clockIn, breaks, clockOut);
		}
	}, 1000 * 10);

	const actionButtonStyle = {
		minWidth: "9em",
	};

	const summaryTableCellStyle = {
		minWidth: "4em",
	};

	const post = async (
		action: "clockIn" | "breakIn" | "breakOut" | "clockOut",
		time: Date
	) => {
		return await fetch("/api/timesheet", {
			method: "POST",
			body: JSON.stringify({
				action: action,
				date: currentTime.toISOString(),
				time: time.toISOString(),
			}),
		});
	};

	const onClockInHandle = async () => {
		try {
			const response = await post("clockIn", currentTime);
			if (response.status !== 200) {
				const error = response.json();
				throw new Error(JSON.stringify(error));
			}
			setClockIn(new Date());
		} catch (error) {
			setFailureMessages([...failureMessages, `Failed to send Clock In`]);
			return;
		}

		if (clockInRef.current) clockInRef.current.disabled = true;

		const clockoutTime = new Date(currentTime);
		clockoutTime.setHours(clockoutTime.getHours() + 8);
		clockoutTime.setMinutes(clockoutTime.getMinutes() + 30);
		setPredictedClockout(clockoutTime);
	};

	const onBreakInHandle = async () => {
		try {
			const response = await post("breakIn", currentTime);
			if (response.status !== 200) {
				const error = response.json();
				throw new Error(JSON.stringify(error));
			}
			setBreaks([...breaks, { break_in: new Date(), break_out: undefined }]);
		} catch (error) {
			setFailureMessages([...failureMessages, `Failed to send Break In`]);
			return;
		}
		if (breakStartRef.current) breakStartRef.current.disabled = true;
		if (breakEndRef.current) breakEndRef.current.disabled = false;
	};

	const onBreakEndHandle = async () => {
		try {
			const response = await post("breakOut", currentTime);
			if (response.status !== 200) {
				const error = response.json();
				throw new Error(JSON.stringify(error));
			}
			const incompleteBreakEntry = breaks.filter(
				(breakEntries) => breakEntries.break_out === undefined
			)[0];
			const breakEntriesCopy = breaks.filter(
				(entry) => entry.break_out !== undefined
			);

			incompleteBreakEntry.break_out = new Date();
			breakEntriesCopy.push(incompleteBreakEntry);
			setBreaks(breakEntriesCopy);
		} catch (error) {
			setFailureMessages([...failureMessages, `Failed to send Break Out`]);
			return;
		}
		if (breakStartRef.current) breakStartRef.current.disabled = false;
		if (breakEndRef.current) breakEndRef.current.disabled = true;
	};

	const onClockOutHandle = async () => {
		try {
			const response = await post("clockOut", currentTime);
			if (response.status !== 200) {
				const error = response.json();
				throw new Error(JSON.stringify(error));
			}
			setClockOut(new Date());
		} catch (error) {
			setFailureMessages([...failureMessages, `Failed to send Clock Out`]);
			return;
		}
		if (clockInRef.current) clockInRef.current.disabled = true;
		if (breakStartRef.current) breakStartRef.current.disabled = true;
		if (breakEndRef.current) breakEndRef.current.disabled = true;
		if (clockOutRef.current) clockOutRef.current.disabled = true;
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
						ref={clockInRef as React.LegacyRef<HTMLButtonElement>}
					>
						Clock in
					</button>
				</div>
				<div className="column centerContent">
					<button
						className="button"
						onClick={onBreakInHandle}
						style={actionButtonStyle}
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
						ref={clockOutRef as React.LegacyRef<HTMLButtonElement>}
					>
						Clock out
					</button>
				</div>
			</div>

			<hr />

			{predictedClockout && (
				<div>
					<p>Predicted finish time {toHHMM(predictedClockout)}</p>
				</div>
			)}

			<hr />

			{!clockIn && <p className="title is-4">No entries yet</p>}
			{clockIn && (
				<>
					<p className="title is-4 mb-2">Workday</p>
					<table className="ml-3">
						<tbody>
							<tr>
								<td style={summaryTableCellStyle}>{toHHMM(clockIn)}</td>
								<td>Day started</td>
							</tr>
							{breaks.map((breakEntry, i) => {
								return (
									<>
										<tr key={`${i}-${breakEntry.break_in.toISOString()}`}>
											<td
												style={summaryTableCellStyle}
												key={`${i}-${breakEntry.break_in.toISOString()}-value`}
											>
												{toHHMM(breakEntry.break_in)}
											</td>
											<td
												key={`${i}-${breakEntry.break_in.toISOString()}-label`}
											>
												Break started
											</td>
										</tr>

										{breakEntry.break_out && (
											<tr key={`${i}-${breakEntry.break_in.toISOString()}-end`}>
												<td
													style={summaryTableCellStyle}
													key={`${i}-${breakEntry.break_in.toISOString()}-end-value`}
												>
													{toHHMM(breakEntry.break_out)}
												</td>
												<td
													key={`${i}-${breakEntry.break_in.toISOString()}-end-label`}
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
		</>
	);
}
