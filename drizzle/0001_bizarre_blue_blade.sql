DO $$ BEGIN
 CREATE TYPE "energy_type" AS ENUM('electricity', 'gas');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "energy_usage" (
	"type" "energy_type" NOT NULL,
	"kwh" numeric NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "energy_usage" ADD CONSTRAINT "energy_usage_type_start_date_end_date" PRIMARY KEY("type","start_date","end_date");
