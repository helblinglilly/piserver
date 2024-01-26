import { ITimesheet } from "@/db/Timesheet";
import TodaysEntries from "./TodayEntries";

const Day = ({ day, data }: { day: string; data: ITimesheet | undefined }) => {
	return (
		<div className="card">
			<div className="card-header">
				<div className="card-header-title">
					<h1 className="title is-5">{day}</h1>
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
