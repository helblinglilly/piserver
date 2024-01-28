import { ITimesheet } from "@/db/Timesheet";
import { Weekdays } from "@/utilities/dateUtils";
import Link from "next/link";
import TodaysEntries from "./TodayEntries";

const Day = ({
	day,
	data,
}: {
	day: Date | undefined;
	data: ITimesheet | undefined;
}) => {
	if (!day) {
		return <p>Error</p>;
	}
	return (
		<div className="card">
			<div className="card-header">
				<div
					className="card-header-title"
					style={{ justifyContent: "space-between" }}
				>
					<h1 className="title is-5" style={{ marginBottom: 0 }}>
						{Weekdays[new Date(day).getDay()]}
					</h1>

					<Link
						href={`/timesheet/edit?date=${new Date(day).toISOString().split("T")[0]}`}
					>
						Edit
					</Link>
				</div>
			</div>
			<div className="card-content">
				{data ? (
					<TodaysEntries
						clockIn={new Date(data.clockIn)}
						breaks={data.breaks.map((a) => {
							return {
								breakIn: new Date(a.breakIn),
								breakOut: a.breakOut ? new Date(a.breakOut) : null,
							};
						})}
						clockOut={data.clockOut ? new Date(data.clockOut) : undefined}
					/>
				) : (
					<p>No data</p>
				)}
			</div>
		</div>
	);
};

export default Day;
