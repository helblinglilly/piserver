import { ITimesheet } from "@/db/Timesheet";
import { toDayDDMM, toHHMM } from "@/utilities/dateUtils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { IPatchTimesheet } from "../api/timesheet";

export default function EditTimesheet() {
	const searchParams = useSearchParams();
	const editDateParam = searchParams.get("date");
	const editDate = new Date(editDateParam ?? 0);
	editDate.setHours(12);

	const { error, data, isLoading } = useQuery({
		queryKey: [`dailyData-${editDate.toISOString()}`],
		queryFn: (): Promise<ITimesheet> =>
			fetch(
				`/api/timesheet?username=joel&date=${editDate.toISOString()}&mode=daily`,
			).then((res) => {
				if (res.status === 204) {
					return {
						clockIn: new Date(editDateParam + "T" + "01:00"),
						clockOut: undefined,
						breaks: [],
					};
				}
				return res.json() as Promise<ITimesheet>;
			}),
	});

	const [modifiedData, setModifiedData] = useState(data);

	useEffect(() => {
		setModifiedData(data);
	}, [data, editDateParam]);

	const handleOnSubmit = async () => {
		try {
			const body: IPatchTimesheet = {
				username: "joel",
				date: new Date(editDate).toISOString(),
				timesheet: modifiedData,
			};
			await fetch("/api/timesheet", {
				method: "PATCH",
				body: JSON.stringify(body),
			});
		} catch (err) {
			console.log(err);
		}
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

	if (isLoading || !modifiedData) {
		return <p>Loading...</p>;
	} else {
		return (
			<>
				<h1 className="title is-3">
					Editing: {toDayDDMM(new Date(editDateParam + "T12:00:00.000Z"))}
				</h1>
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
										modifiedData.clockOut
											? toHHMM(new Date(modifiedData.clockOut))
											: "23:59"
									}
									defaultValue={toHHMM(new Date(modifiedData.clockIn))}
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
										modifiedData.clockOut
											? toHHMM(new Date(modifiedData.clockOut))
											: "23:59"
									}
									min={toHHMM(new Date(modifiedData.clockIn))}
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

				{modifiedData.breaks.map((entry, i) => {
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
										<input
											type="time"
											style={{ width: "100%", height: "2rem" }}
											defaultValue={toHHMM(new Date(entry.breakIn))}
											min={toHHMM(new Date(modifiedData.clockIn))}
											onChange={(val) => {
												const breakCopy = [...modifiedData.breaks];
												breakCopy[i].breakIn = new Date(
													editDateParam + "T" + val.target.value,
												);

												setModifiedData({
													...modifiedData,
													breaks: breakCopy,
												});
											}}
										/>
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
										<input
											type="time"
											style={{ width: "100%", height: "2rem" }}
											defaultValue={entry.breakOut ? toHHMM(new Date()) : "23:59"}
											min={toHHMM(new Date(modifiedData.clockIn))}
											onChange={(val) => {
												const breakCopy = [...modifiedData.breaks];
												breakCopy[i].breakOut = new Date(
													editDateParam + "T" + val.target.value,
												);

												setModifiedData({
													...modifiedData,
													breaks: breakCopy,
												});
											}}
										/>
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
							onClick={() => {
								const breaks = [...modifiedData.breaks];
								breaks.push({
									breakIn: modifiedData.clockIn,
									breakOut: null,
								});
								setModifiedData({
									...modifiedData,
									breaks,
								});
							}}
						>
							Add Break
						</button>
					</div>
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
}
