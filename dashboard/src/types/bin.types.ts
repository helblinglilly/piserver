import { WeekdayLong } from "./common.types";

export type BinDates = {
  BlackDate: Date | "Loading...";
  BlackDay: WeekdayLong | "";
  GreenDate: Date | "Loading...";
  GreenDay: WeekdayLong | "";
};

export type BinModelDateEntry = {
  type: "GREEN" | "BLACK";
  date: Date;
};
