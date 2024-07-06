#!/bin/bash

# Define the path to the SQLite database file
DATABASE="timesheet.sqlite3"

rm $DATABASE

# Check if the database file exists, if not, create it
if [ ! -f "$DATABASE" ]; then
    touch "$DATABASE"
fi

# Define the SQL commands to create the tables
SQL="CREATE TABLE IF NOT EXISTS timesheet (
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    clock_in TEXT NOT NULL,
    clock_out TEXT,
    PRIMARY KEY (username, date)
);
CREATE TABLE IF NOT EXISTS timesheet_breaks (
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    break_in TEXT NOT NULL,
    break_out TEXT,
    PRIMARY KEY (username, date, break_in)
);"

# Execute the SQL commands using sqlite3
echo "$SQL" | sqlite3 $DATABASE