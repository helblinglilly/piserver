import React from "react";
import config from "@/config";
import useTimesheet from "@/hooks/useDailyTimesheet";
import { addMinutesToDate, toHHMM } from "@/utilities/dateUtils";
import { useEffect, useState } from "react";

const PredictedFinish = () => {
	const targetMinutes =
		config.timesheet.hours * 60 +
		config.timesheet.minutes +
		config.timesheet.lunch.hours * 60 +
		config.timesheet.lunch.minutes;

	const [finish, setFinish] = useState(new Date(0));
	const { clockIn } = useTimesheet().timesheet;

	useEffect(() => {
		if (clockIn) {
			setFinish(addMinutesToDate(clockIn, targetMinutes));
		} else {
			setFinish(addMinutesToDate(new Date(), targetMinutes));
		}
		// adding clockIn causes loops
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [targetMinutes]);

	return <p>Predicted Finish: {toHHMM(finish)} </p>;
};

export default PredictedFinish;
