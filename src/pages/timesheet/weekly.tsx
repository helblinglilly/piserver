import Day from "@/components/Timesheet/Day";
import { useQuery } from "react-query";
import WeeklyHourSummary from "@/components/Timesheet/WeeklyHourSummary";
import { useState } from "react";
import {
	addDays,
	addWeek,
	getClosestMonday,
	previousWeek,
} from "@/utilities/dateUtils";
import { IWeeklyResponse } from "../api/timesheet";

export default function Weekly() {
	const [date, setDate] = useState(getClosestMonday(new Date()));

	const { error, data } = useQuery({
		queryKey: [`weeklyData-${date.toISOString()}`],
		queryFn: () =>
			fetch(
				`/api/timesheet?username=joel&mode=weekly&date=${
					addDays(date, 6).toISOString().split("T")[0]
				}`,
			).then((res) => res.json() as Promise<IWeeklyResponse>),
	});

	if (error) return "An error has occurred: " + error;

	return (
		<>
			<div
				style={{
					display: "inline-flex",
					justifyContent: "space-between",
					width: "100%",
					marginBottom: "1rem",
				}}
			>
				<button
					className="button"
					onClick={() => {
						setDate(previousWeek(date));
					}}
				>
					<p className="mobile">Prev</p>
					<p className="desktop">Previous Week</p>
				</button>
				<p style={{ marginTop: "auto", marginBottom: "auto" }}>
					w/c {date.toLocaleDateString("en-GB")}
				</p>
				<button
					className="button"
					onClick={() => {
						setDate(addWeek(date));
					}}
				>
					<p className="mobile">Next</p>
					<p className="desktop">Next Week</p>
				</button>
			</div>
			<div className="columns">
				<div className="column">
					<Day day={data?.mon.date} data={data?.mon.timesheet} />
				</div>

				<div className="column">
					<Day day={data?.tue.date} data={data?.tue.timesheet} />
				</div>
			</div>
			<div className="columns">
				<div className="column">
					<Day day={data?.wed.date} data={data?.wed.timesheet} />
				</div>

				<div className="column">
					<Day day={data?.thu.date} data={data?.thu.timesheet} />
				</div>
			</div>
			<div className="columns">
				<div className="column">
					<Day day={data?.fri.date} data={data?.fri.timesheet} />
				</div>

				<div className="column">
					<div className="card">
						<div className="card-header">
							<div className="card-header-title">
								<h2 className="title is-5">Summary</h2>
							</div>
						</div>

						<div className="card-content">
							{data ? <WeeklyHourSummary weeklySummary={data} /> : <p>No data</p>}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
