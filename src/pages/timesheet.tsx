import {
	toDayDDMM,
	toHHMM,
} from "@/utilities/dateUtils";
import Notification from "@/components/Notification";
import React, { useEffect, useRef, useState } from "react";
import { IBreak, ITimesheet } from "@/db/Timesheet";
import TodaysEntries from "@/components/timesheet/TodayEntries";
import PredictedFinish from "@/components/timesheet/PredictedFinish";
import useTime from "@/hooks/useTime";

export interface TodaysTimesheet {
  clockIn: Date | undefined | null,
  breaks: IBreak[] | undefined | null,
  clockOut: Date | undefined | null,
}


export default function Timesheet() {
	const [failureMessages, setFailureMessages] = useState<string[]>([]);
	
	const currentTime = useTime();
	const [clockIn, setClockIn] = useState<Date | undefined>();
	const [breaks, setBreaks] = useState<IBreak[]>([]);
	const [clockOut, setClockOut] = useState<Date | undefined | null>();

	const clockInRef = useRef<HTMLButtonElement>();
	const breakStartRef = useRef<HTMLButtonElement>();
	const breakEndRef = useRef<HTMLButtonElement>();
	const clockOutRef = useRef<HTMLButtonElement>();

	const fetchInitialData = async () => {
		const [todayResponse, weekToDateResponse] = await Promise.all([
			fetch(
				`/api/timesheet?username=joel&date=${new Date().toISOString()}&mode=daily`,
			),
			fetch(
				`/api/timesheet?username=joel&date=${
					new Date().toISOString().split("T")[0]
				}&mode=weekly`,
			),
		]);

		let today : ITimesheet | undefined;
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
			today: today,
			weekToDate: weekToDate
		}
	}
	useEffect(() => {
		const run = async () => {
			const { today, weekToDate } = await fetchInitialData();
			if (today) {
				setClockIn(new Date(today.clockIn));
				setBreaks(
					today.breaks.map((entry) => {
						return {
							breakIn: new Date(entry.breakIn),
							breakOut: entry.breakOut ? new Date(entry.breakOut) : null,
						};
					})
				);
				setClockOut(today.clockOut ? new Date(today.clockOut) : undefined);
			}
			console.log("Week to date", weekToDate)
		};
		run();
	}, [clockInRef]);

	useEffect(() => {
		if (clockIn && clockInRef.current){
			clockInRef.current.disabled = true;
		}
		if (breaks.length > 0 && breakStartRef.current && breakEndRef.current){
			if (breaks[breaks.length - 1].breakOut){
				breakStartRef.current.disabled = false;
				breakEndRef.current.disabled = true;
			} else {
				breakStartRef.current.disabled = true;
				breakEndRef.current.disabled = false;
			}
		}
		if (clockOut && clockOutRef.current){
			clockOutRef.current.disabled = true;
		}
	}, [clockIn, breaks, clockOut])

	const actionButtonStyle = {
		minWidth: "9em",
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
				date: new Date().toISOString(),
				time: time.toISOString(),
			}),
		});
	};

	const onClockInHandle = async () => {
		try {
			const response = await post("clockIn", new Date());
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

		const clockoutTime = new Date();
		clockoutTime.setHours(clockoutTime.getHours() + 8);
		clockoutTime.setMinutes(clockoutTime.getMinutes() + 30);
	};

	const onBreakInHandle = async () => {
		try {
			const response = await post("breakIn", new Date());
			if (response.status !== 200) {
				const error = response.json();
				throw new Error(JSON.stringify(error));
			}
			setBreaks([...breaks, { breakIn: new Date(), breakOut: null }]);
		} catch (error) {
			setFailureMessages([...failureMessages, "Failed to send Break In"]);
			return;
		}
		if (breakStartRef.current) breakStartRef.current.disabled = true;
		if (breakEndRef.current) breakEndRef.current.disabled = false;
	};

	const onBreakEndHandle = async () => {
		try {
			const response = await post("breakOut", new Date());
			if (response.status !== 200) {
				const error = response.json();
				throw new Error(JSON.stringify(error));
			}
			const incompleteBreakEntry = breaks.filter(
				(breakEntries) => breakEntries.breakOut === undefined,
			)[0];
			const breakEntriesCopy = breaks.filter(
				(entry) => entry.breakOut !== undefined,
			);

			incompleteBreakEntry.breakOut = new Date();
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
			const response = await post("clockOut", new Date);
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

			<p className="title is-3">{toDayDDMM(new Date())}</p>

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

			<PredictedFinish clockIn={clockIn} breaks={breaks} clockOut={clockOut} />

			<hr />
			
			<TodaysEntries  clockIn={clockIn} breaks={breaks} clockOut={clockOut}/>
			<hr />
		</>
	);
}
