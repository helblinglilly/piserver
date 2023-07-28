import config from "@/config";
import { TodaysTimesheet } from "@/pages/timesheet";
import { addMinutesToDate, minutesWorkedInDay, toHHMM } from "@/utilities/dateUtils";
import { useEffect, useState } from "react";

export default function PredictedFinish(timesheet: TodaysTimesheet){
  const targetMinutes = (config.timesheet.hours * 60) + config.timesheet.minutes + (config.timesheet.lunch.hours * 60) + config.timesheet.lunch.minutes;
  const workedMinutes = minutesWorkedInDay(timesheet.clockIn, timesheet.breaks, timesheet.clockOut);

  const [finish, setFinish] = useState(new Date(0));

  useEffect(() => {
    if (timesheet.clockIn){
      setFinish(addMinutesToDate( timesheet.clockIn, targetMinutes))
    } else {
      setFinish(addMinutesToDate( new Date(), targetMinutes))
    }
  }, [])
  return <>
  <p>Target Minutes: {targetMinutes}</p>
  <p>Worked minutes: {workedMinutes}</p>
  <p>Predicted Finish: {toHHMM(finish)} </p>
  </>
}