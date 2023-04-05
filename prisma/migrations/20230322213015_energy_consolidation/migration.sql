-- CreateTable
CREATE TABLE "bin_dates" (
    "bin_type" VARCHAR(12) NOT NULL,
    "collection_date" DATE NOT NULL,

    CONSTRAINT "bin_dates_pkey" PRIMARY KEY ("bin_type","collection_date")
);

-- CreateTable
CREATE TABLE "energy_bill" (
    "is_electric" BOOLEAN NOT NULL,
    "is_gas" BOOLEAN NOT NULL,
    "billing_start" DATE NOT NULL,
    "billing_end" DATE NOT NULL,
    "standing_order_charge_days" SMALLINT NOT NULL,
    "standing_order_rate" DECIMAL NOT NULL,
    "usage_kwh" DECIMAL NOT NULL,
    "rate_kwh" DECIMAL NOT NULL,
    "pre_tax" DECIMAL NOT NULL,
    "after_tax" DECIMAL NOT NULL,

    CONSTRAINT "energy_bill_pkey" PRIMARY KEY ("is_electric","is_gas","billing_start","billing_end")
);

-- CreateTable
CREATE TABLE "energy_usage" (
    "is_electric" BOOLEAN NOT NULL,
    "is_gas" BOOLEAN NOT NULL,
    "usage_kwh" REAL NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "entry_created" DATE NOT NULL,

    CONSTRAINT "energy_usage_pkey" PRIMARY KEY ("is_electric","is_gas","usage_kwh","start_date","end_date")
);

-- CreateTable
CREATE TABLE "stopwatch" (
    "username" VARCHAR NOT NULL,
    "day_date" DATE NOT NULL,
    "timestamp" TIME(6) NOT NULL,
    "action" VARCHAR(5) NOT NULL,

    CONSTRAINT "stopwatch_pkey" PRIMARY KEY ("username","day_date","timestamp","action")
);

-- CreateTable
CREATE TABLE "timesheet" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "day_date" DATE NOT NULL,
    "clock_in" TIME(6) NOT NULL,
    "break_in" TIME(6),
    "break_out" TIME(6),
    "clock_out" TIME(6),

    CONSTRAINT "timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usertable" (
    "ip" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,

    CONSTRAINT "usertable_pkey" PRIMARY KEY ("ip")
);

-- CreateIndex
CREATE UNIQUE INDEX "energy_bill_billing_start_key" ON "energy_bill"("billing_start");

-- CreateIndex
CREATE UNIQUE INDEX "energy_bill_billing_end_key" ON "energy_bill"("billing_end");
