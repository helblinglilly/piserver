CREATE TABLE IF NOT EXISTS "timesheet" (
	"username" varchar NOT NULL,
	"date" date NOT NULL,
	"clock_in" timestamp with time zone NOT NULL,
	"clock_out" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_username_date" PRIMARY KEY("username","date");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timesheet_breaks" (
	"username" varchar NOT NULL,
	"date" date NOT NULL,
	"break_in" timestamp with time zone NOT NULL,
	"break_out" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "timesheet_breaks" ADD CONSTRAINT "timesheet_breaks_username_date_break_in" PRIMARY KEY("username","date","break_in");
