import React from "react";
import config from "@/config";
import useTimesheet from "@/hooks/useDailyTimesheet";
import { minutesWorkedInDay, toHHMM } from "@/utilities/dateUtils";
import { useEffect, useState } from "react";

const PredictedFinish = () => {
	const targetMinutes =
		config.timesheet.hours * 60 +
		config.timesheet.minutes +
		config.timesheet.lunch.hours * 60 +
		config.timesheet.lunch.minutes;
	
	const [minutesWorked, setMinutesWorked] = useState(0);
	const [finishTime, setFinishTime] = useState(new Date(0));

	const { clockIn, breaks, clockOut } = useTimesheet().timesheet;

	useEffect(() => {
		setMinutesWorked(minutesWorkedInDay(clockIn, breaks, clockOut));
	}, [clockIn, breaks, clockOut]);

	useEffect(() => {
		const minutesRemaining = (targetMinutes - (breaks.length >= 1 ? 60 : 0)) - minutesWorked;
		const currentTime = new Date();
		const remainingTime = new Date(currentTime.getTime() + minutesRemaining * 60000);
		setFinishTime(remainingTime);
	}, [breaks.length, minutesWorked, targetMinutes]);

	return <p>Predicted Finish: {toHHMM(finishTime)} </p>;
};

export default PredictedFinish;
