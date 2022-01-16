# piserver
Raspberry Pi home server web page

## Features
### Timesheet
Assumes a 7.5h working day (not accounting for breaks) and that only a single break will be taken throughout the day
- Enter clock in, break in, break out, clock out
- View records
- Edit previous records

#### Security Disclaimer
When a user navigates to `/timesheet` for the first time and their IP address is not recognised yet, they will be prompted to select a user, and that entry is written to the database. IP addresses can be spoofed, don't deploy this code in a live environment, or in an environment where you do not trust your users.

## Deployment Prerequisites
- PM2 Installed
  - `npm install pm2 -g`
- Postgres instance
- `.env` file in project root (development) or `~/.env` in production containing:
  - POSTGRES_USER
  - POSTGRES_HOST
  - POSTGRES_DATABASE
  - POSTGRES_PASSWORD
