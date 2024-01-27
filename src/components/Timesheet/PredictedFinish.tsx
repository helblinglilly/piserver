import config from "@/config";
import { TodaysTimesheet } from "@/pages/timesheet";
import { addMinutesToDate, toHHMM } from "@/utilities/dateUtils";
import { useEffect, useState } from "react";

const PredictedFinish = ({
	timesheet,
	currentTime,
}: {
	timesheet: TodaysTimesheet;
	currentTime: Date;
}) => {
	const targetMinutes =
		config.timesheet.hours * 60 +
		config.timesheet.minutes +
		config.timesheet.lunch.hours * 60 +
		config.timesheet.lunch.minutes;

	const [finish, setFinish] = useState(new Date(0));

	useEffect(() => {
		if (timesheet.clockIn) {
			setFinish(addMinutesToDate(timesheet.clockIn, targetMinutes));
		} else {
			setFinish(addMinutesToDate(currentTime, targetMinutes));
		}
	}, [currentTime, targetMinutes, timesheet.clockIn]);

	return <p>Predicted Finish: {toHHMM(finish)} </p>;
};

export default PredictedFinish;
