import Day from "@/components/Timesheet/Day";
import { useQuery } from "react-query";
import { WeeklyTimesheet } from ".";
import WeeklyHourSummary from "@/components/Timesheet/WeeklyHourSummary";
import { useState } from "react";
import {
	addDays,
	addWeek,
	getClosestMonday,
	previousWeek,
} from "@/utilities/dateUtils";

export default function Weekly() {
	const [date, setDate] = useState(getClosestMonday(new Date()));

	const { error, data } = useQuery({
		queryKey: [`weeklyData-${date.toISOString()}`],
		queryFn: () =>
			fetch(
				`/api/timesheet?username=joel&mode=weekly&date=${
					addDays(date, 6).toISOString().split("T")[0]
				}`,
			).then((res) => res.json() as Promise<WeeklyTimesheet>),
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
					Previous week
				</button>
				<p>w/c {date.toLocaleDateString("en-GB")}</p>
				<button
					className="button"
					onClick={() => {
						setDate(addWeek(date));
					}}
				>
					Next week
				</button>
			</div>
			<div className="columns">
				<div className="column">
					<Day day="Monday" data={data?.mon ?? undefined} />
				</div>

				<div className="column">
					<Day day="Tuesday" data={data?.tue ?? undefined} />
				</div>
			</div>
			<div className="columns">
				<div className="column">
					<Day day="Wednesday" data={data?.wed ?? undefined} />
				</div>

				<div className="column">
					<Day day="Thursday" data={data?.thu ?? undefined} />
				</div>
			</div>
			<div className="columns">
				<div className="column">
					<Day day="Friday" data={data?.fri ?? undefined} />
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
