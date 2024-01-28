import { ITimesheet } from "@/db/Timesheet";
import { useSearchParams } from "next/navigation";
import { useQuery } from "react-query";

export default function EditTimesheet() {
	const searchParams = useSearchParams();
	const editDateParam = searchParams.get("date");
	const editDate = new Date(editDateParam ?? 0);
	editDate.setHours(12);

	const { error, data } = useQuery({
		queryKey: [`dailyData-${editDate.toISOString()}`],
		queryFn: () =>
			fetch(
				`/api/timesheet?username=joel&date=${editDate.toISOString()}&mode=daily`,
			).then((res) => {
				return res.json() as Promise<ITimesheet | undefined>;
			}),
	});

	return (
		<>
			<div className="columns">
				<div className="column">
					<div className="card">
						<div className="card-header">
							<div className="card-header-title">
								<p>Clock In</p>
							</div>
						</div>

						<div className="card-content">
							<p>{new Date(data?.clockIn ?? 0).toLocaleTimeString("en-GB")}</p>
						</div>
					</div>
				</div>

				<div className="column">
					<div className="card">
						<div className="card-header">
							<div className="card-header-title">
								<p>Clock Out</p>
							</div>
						</div>

						<div className="card-content">
							<p>{new Date(data?.clockOut ?? 0).toLocaleTimeString("en-GB")}</p>
						</div>
					</div>
				</div>
			</div>

			{data?.breaks.map((entry) => {
				return (
					<div className="columns" key={`break-${entry.breakIn}`}>
						<div className="column">
							<div className="card">
								<div className="card-header">
									<div className="card-header-title">
										<p>Break In</p>
									</div>
								</div>
								<div className="card-content">
									<p>{new Date(entry.breakIn).toLocaleTimeString("en-GB")}</p>
								</div>
							</div>
						</div>

						<div className="column">
							<div className="card">
								<div className="card-header">
									<div className="card-header-title">
										<p>Break Out</p>
									</div>
								</div>
								<div className="card-content">
									<p>{new Date(entry.breakOut ?? 0).toLocaleTimeString("en-GB")}</p>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
}
