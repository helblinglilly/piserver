import { ITimesheet } from "@/db/Timesheet";
import { toHHMM } from "@/utilities/dateUtils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

	const [modifiedData, setModifiedData] = useState(data);

	useEffect(() => {
		setModifiedData(data);
	}, [data]);

	const handleOnSubmit = () => {
		console.log(modifiedData);
	};

	const handleOnReset = () => {
		setModifiedData(data);
	};

	if (error) {
		return (
			<>
				<p>An error has occurred</p>
				<p>{JSON.stringify(error)}</p>
			</>
		);
	}

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
							<input
								type="time"
								style={{ width: "100%", height: "2rem" }}
								max={
									modifiedData?.clockOut
										? toHHMM(new Date(modifiedData.clockOut))
										: "23:59"
								}
								defaultValue={
									modifiedData?.clockIn
										? toHHMM(new Date(modifiedData.clockIn))
										: "01:00"
								}
								onChange={(val) => {
									// @ts-ignore Stupid
									setModifiedData({
										...modifiedData,
										clockIn: new Date(editDateParam + "T" + val.target.value),
									});
								}}
								required
							/>
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
							<input
								type="time"
								style={{ width: "100%", height: "2rem" }}
								defaultValue={
									modifiedData?.clockOut
										? toHHMM(new Date(modifiedData.clockOut))
										: "23:00"
								}
								min={
									modifiedData?.clockIn
										? toHHMM(new Date(modifiedData.clockIn))
										: "02:00"
								}
								onChange={(val) => {
									// @ts-ignore Stupid
									setModifiedData({
										...modifiedData,
										clockOut: new Date(editDateParam + "T" + val.target.value),
									});
								}}
							/>
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

			<div className="columns">
				<div className="column">
					<button
						className="button"
						style={{ width: "100%" }}
						onClick={handleOnReset}
					>
						Reset
					</button>
				</div>
				<div className="column">
					<button
						className="button is-success"
						style={{ width: "100%" }}
						onClick={handleOnSubmit}
					>
						Save
					</button>
				</div>
			</div>
		</>
	);
}
