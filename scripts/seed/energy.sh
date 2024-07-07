#!/bin/bash

# Define the path to the SQLite database file
DATABASE="energy.sqlite3"

# rm $DATABASE

# Check if the database file exists, if not, create it
if [ ! -f "$DATABASE" ]; then
    touch "$DATABASE"
fi

# Define the SQL commands to create the tables
SQL="CREATE TABLE IF NOT EXISTS energy_bills (
    energy_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    usage REAL NOT NULL,
    usage_rate REAL NOT NULL,
    standing_charge REAL NOT NULL,
    cost REAL NOT NULL,
    charged REAL NOT NULL,
    PRIMARY KEY (energy_type, start_date, end_date)
);"

# Execute the SQL commands using sqlite3
echo "$SQL" | sqlite3 $DATABASE