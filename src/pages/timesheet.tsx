import {
	getPreviousMonday,
	toDayDDMM,
	toHHMM,
	toHHMMUTC,
} from "@/utilities/dateUtils";
import Notification from "@/components/Notification";
import React, { useEffect, useRef, useState } from "react";
import { ITimesheet } from "@/db/Timesheet";
import config from "@/config";

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

	const [predictedClockout, setPredictedClockout] = useState<Date | undefined>();

	const clockInRef = useRef<HTMLButtonElement>();
	const breakStartRef = useRef<HTMLButtonElement>();
	const breakEndRef = useRef<HTMLButtonElement>();
	const clockOutRef = useRef<HTMLButtonElement>();

	const [weekToDateDifference, setWeekToDateDifference] = useState<
		{ symbol: string; hours: number; minutes: number } | undefined
	>();

	const calculateAndSetWorkedTime = (
		timeOverride: Date,
		clockInOverride: Date,
		breakOverride: IBreak[],
		clockOutOverride: Date | undefined,
	) => {
		if (breakOverride.length === 0) {
			setWorkedTime(new Date(timeOverride.valueOf() - clockInOverride.valueOf()));
			return;
		}

		let accummulator = new Date(0);
		let previousBreakEnd: Date | undefined | null;

		breakOverride.forEach((breakEntry, i) => {
			if (i === 0) {
				accummulator = new Date(
					breakEntry.break_in.valueOf() - clockInOverride.valueOf(),
				);
				previousBreakEnd = breakEntry.break_out;
			}

			if (
				i < breakOverride.length - 1 &&
				!(previousBreakEnd === undefined || previousBreakEnd === null)
			) {
				accummulator = new Date(
					breakEntry.break_in.valueOf() -
						previousBreakEnd.valueOf() +
						accummulator.valueOf(),
				);
			} else if (
				// The last entry - add the difference between break end and now / clock out
				i === breakOverride.length - 1 &&
				!(previousBreakEnd === undefined || previousBreakEnd === null)
			) {
				const lastWorkedTimestamp = clockOutOverride
					? clockOutOverride
					: timeOverride;
				accummulator = new Date(
					lastWorkedTimestamp.valueOf() -
						previousBreakEnd.valueOf() +
						accummulator.valueOf(),
				);
			}
		});
		setWorkedTime(accummulator);
	};

	useEffect(() => {
		const fetchData = async (): Promise<{
			today: ITimesheet | undefined;
			weekToDate: { hours: number; minutes: number } | undefined;
		}> => {
			const [todayResponse, weekToDateResponse] = await Promise.all([
				fetch(
					`/api/timesheet?username=joel&date=${currentTime.toISOString()}&mode=daily`,
				),
				fetch(
					`/api/timesheet?username=joel&date=${
						currentTime.toISOString().split("T")[0]
					}&mode=weekly`,
				),
			]);

			let today;
			let weekToDate;

			if (todayResponse.status > 204) {
				console.error(
					`Failed to fetch today's timesheet data - Error ${todayResponse.status}`,
				);
			} else if (todayResponse.status === 200) {
				try {
					today = await todayResponse.json();
				} catch (err) {
					console.log(`Failed to parse today's timesheet data - Error ${err}`);
				}
			}

			if (weekToDateResponse.status > 204) {
				console.error(
					`Failed to fetch week to date's timesheet data - Error ${weekToDateResponse.status}`,
				);
			} else if (weekToDateResponse.status === 200) {
				try {
					weekToDate = await weekToDateResponse.json();
				} catch (err) {
					console.log(
						`Failed to parse week to date's timesheet data - Error ${err}`,
					);
				}
			}

			return {
				today,
				weekToDate,
			};
		};

		const populateTodayData = (today: ITimesheet) => {
			setClockIn(new Date(today.clockIn));
			if (clockInRef.current) {
				clockInRef.current.disabled = true;
			}

			const existingBreaks: IBreak[] = [];

			let isOnBreak = false;

			today.breaks
				.sort((a, b) => (new Date(a.breakIn) < new Date(b.breakOut ?? -1) ? -1 : 1))
				.forEach((entry) => {
					isOnBreak = entry.breakOut === null;

					if (entry.breakOut) {
						existingBreaks.push({
							break_in: new Date(entry.breakIn),
							break_out: new Date(entry.breakOut),
						});
					} else {
						existingBreaks.push({
							break_in: new Date(-1),
							break_out: undefined,
						});
					}
				});

			setBreaks(existingBreaks);

			if (breakEndRef.current && breakStartRef.current) {
				breakStartRef.current.disabled = isOnBreak;
				breakEndRef.current.disabled = !isOnBreak;
			}

			if (today.clockOut) {
				setClockOut(new Date(today.clockOut));
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
				new Date(today.clockIn),
				existingBreaks,
				today.clockOut ? new Date(today.clockOut) : undefined,
			);
		};

		const populateWeekToDate = (weekToDate: {
			hours: number;
			minutes: number;
		}) => {
			const daysSinceMonday =
				currentTime.getDate() - getPreviousMonday(currentTime).getDate();

			const totalMinutesToHaveWorked =
				config.timesheet.hours * daysSinceMonday * 60 +
				config.timesheet.minutes * daysSinceMonday;

			const totalMinutesWorked =
				weekToDate.hours * daysSinceMonday * 60 +
				weekToDate.minutes * daysSinceMonday;

			const difference = totalMinutesToHaveWorked - totalMinutesWorked;
			const hours = Math.abs(difference / 60);
			const minutes = Math.abs(difference % 60);

			setWeekToDateDifference({
				symbol: difference < 0 ? "-" : "+",
				hours: hours,
				minutes: minutes,
			});
		};

		const populateData = async () => {
			const data = await fetchData();
			console.log(data);

			if (data.today) {
				populateTodayData(data.today);
			}

			if (data.weekToDate) {
				populateWeekToDate(data.weekToDate);
			}
		};

		populateData();
	}, [currentTime, failureMessages]);

	useEffect(() => {
		const updatePredictedClockOut = (breakOverride?: IBreak[]) => {
			if (!clockIn) return;
			// There's a bug here where lunch minutes + contract minutes will add up to over 1h
			// but I cba to look at that right now
			let hoursToWork = config.timesheet.hours + config.timesheet.lunch.hours;
			let minutesToWork =
				config.timesheet.minutes + config.timesheet.lunch.minutes;

			const breakToCheck = breakOverride ? breakOverride : breaks;
			if (breakToCheck.length > 0) {
				// Set to the actual amount of hours that need to be worked
				hoursToWork = config.timesheet.hours;
			}

			const hoursLeft = hoursToWork - workedTime.getUTCHours();
			const minutesLeft = minutesToWork - workedTime.getUTCMinutes();

			const newPredictedClockout = new Date(currentTime);
			newPredictedClockout.setHours(newPredictedClockout.getHours() + hoursLeft);
			newPredictedClockout.setMinutes(
				newPredictedClockout.getMinutes() + minutesLeft,
			);
			newPredictedClockout.setSeconds(0);
			newPredictedClockout.setMilliseconds(0);

			setPredictedClockout(newPredictedClockout);
		};

		updatePredictedClockOut(breaks);
	}, [breaks, clockIn, currentTime, workedTime]);

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
		time: Date,
	) => {
		return fetch("/api/timesheet", {
			method: "POST",
			body: JSON.stringify({
				username: "joel",
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
			console.log(error);
			setFailureMessages([...failureMessages, "Failed to send Clock In"]);
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
			setFailureMessages([...failureMessages, "Failed to send Break In"]);
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
				(breakEntries) => breakEntries.break_out === undefined,
			)[0];
			const breakEntriesCopy = breaks.filter(
				(entry) => entry.break_out !== undefined,
			);

			incompleteBreakEntry.break_out = new Date();
			breakEntriesCopy.push(incompleteBreakEntry);
			setBreaks(breakEntriesCopy);
		} catch (error) {
			setFailureMessages([...failureMessages, "Failed to send Break Out"]);
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
			setFailureMessages([...failureMessages, "Failed to send Clock Out"]);
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

			{!clockIn ? <p className="title is-4">No entries yet</p> : <hr />}
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
											<td key={`${i}-${breakEntry.break_in.toISOString()}-label`}>
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
												<td key={`${i}-${breakEntry.break_in.toISOString()}-end-label`}>
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
			<p className="title is-4 mb-2">Week to date</p>
			{weekToDateDifference && (
				<p>
					{weekToDateDifference.symbol}
					{weekToDateDifference.hours}h {weekToDateDifference.minutes}min
				</p>
			)}
		</>
	);
}
