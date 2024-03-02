import { ITimesheet } from "@/db/Timesheet";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

const intialTimesheet: ITimesheet = {
	clockIn: undefined,
	breaks: [],
	clockOut: undefined,
};

export enum TimesheetActions {
	clockIn = "clockIn",
	breakIn = "breakIn",
	breakOut = "breakOut",
	clockOut = "clockOut",
}

async function getDailyTimesheet(day: Date, username: string) {
	const response = await fetch(
		`/api/timesheet?username=${username}&date=${day.toISOString()}&mode=daily`,
	);
	return (await response.json()) as ITimesheet;
}

export const useTimesheet = () => {
	const [date, setDate] = useState(new Date());
	const [user, setUser] = useState("joel");

	const {
		data: timesheet = intialTimesheet,
		isLoading,
		isError,
		refetch: refetch,
	} = useQuery({
		queryKey: ["timesheet-daily", date, user],
		queryFn: () => getDailyTimesheet(date, user),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const recordEntry = async (action: TimesheetActions) => {
		const response = await fetch("/api/timesheet", {
			method: "POST",
			body: JSON.stringify({
				username: user,
				action: action,
				date: date.toISOString(),
				time: new Date().toISOString(),
			}),
		});

		refetch();

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
	};

	useEffect(() => {
		refetch();
	}, [date, user, refetch]);

	return {
		changeDate: setDate,
		changeUser: setUser,
		timesheet: {
			clockIn: timesheet.clockIn ? new Date(timesheet.clockIn) : undefined,
			clockOut: timesheet.clockOut ? new Date(timesheet.clockOut) : undefined,
			breaks: timesheet.breaks.map((entry) => {
				return {
					breakIn: new Date(entry.breakIn),
					breakOut: entry.breakOut ? new Date(entry.breakOut) : undefined,
				};
			}),
		},
		isLoading,
		isError,
		recordEntry,
		mostRecentBreak:
			timesheet.breaks.length > 0
				? timesheet.breaks[timesheet.breaks.length - 1]
				: undefined,
	};
};

export default useTimesheet;
