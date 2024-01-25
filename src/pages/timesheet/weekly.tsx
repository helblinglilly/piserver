import TodaysEntries from "@/components/timesheet/TodayEntries";
import { ITimesheet } from "@/db/Timesheet";
import { useQuery } from "react-query";


const Day = ({ day, data }: { day: string; data: ITimesheet | undefined }) => {
	return <div className="card">
		<div className="card-header">
			<div className="card-header-title">
				<h1 className="title is-5">{day}</h1>
			</div>
		</div>
		<div className="card-content">
			{data ? <TodaysEntries clockIn={new Date(data.clockIn)} breaks={data.breaks.map((a) => {
				return {
					breakIn: new Date(a.breakIn),
					breakOut: a.breakOut ? new Date(a.breakOut) : null,
				};
			})} clockOut={data.clockOut ? new Date(data.clockOut) : undefined} /> : <p>No data</p>}
		</div>
	</div>;
};

export default function Weekly() {
	const date = new Date().toISOString().split("T")[0];
	const { isLoading, error, data } = useQuery({
		queryKey: ["repoData"],
		queryFn: () =>
			fetch(`/api/timesheet?username=joel&mode=weekly&date=${date}`).then(
				(res) => res.json() as Promise<{
					mon: null | ITimesheet;
					tue: null | ITimesheet;
					wed: null | ITimesheet;
					thu: null | ITimesheet;
					fri: null | ITimesheet;
				}>,
			),
	});

	console.log(data);

	if (isLoading) return "Loading...";

	if (error) return "An error has occurred: " + error;

	return <>
		<div className="columns">
			<div className="column">
				<Day day="Monday" data={data?.mon ?? undefined} />
			</div>

			<div className="column">
				<Day day="Tuesday" data={data?.tue ?? undefined} />
			</div>

			<div className="column">
				<Day day="Wednesday" data={data?.wed ?? undefined} />
			</div>

			<div className="column">
				<Day day="Thursday" data={data?.thu ?? undefined} />
			</div>

			<div className="column">
				<Day day="Friday" data={data?.fri ?? undefined} />
			</div>
		</div>


	</>;
}
