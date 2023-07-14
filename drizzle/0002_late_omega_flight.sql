CREATE TABLE IF NOT EXISTS "energy_bills" (
	"type" "energy_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"usage" numeric NOT NULL,
	"usage_rate" numeric NOT NULL,
	"standing_charge" numeric NOT NULL,
	"cost" numeric NOT NULL,
	"charged" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "energy_bills" ADD CONSTRAINT "energy_bills_type_start_date" PRIMARY KEY("type","start_date");
