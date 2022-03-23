# piserver

Raspberry Pi home server web page

## Features

### Timesheet

This feature has been designed to aid time tracking when working from home. Personally, I struggle to keep track of time and know that I have worked several hours of overtime without asking for compensation for a variety of reasons. This feature allows me to keep track of my work-hours without
exposing actual timings to an overcomplicated third party platform.

It is designed for 7.5h work days (not accounting for breaks) with a single lunch break taken. It displays the projected finishing time, keeping track of break timings and showing when the workday will be completed if a shorter break is taken.

![Timesheet Homescreen](./.github/screenshots/timesheet_home.jpg)

You can also look at previous time entries to check any overtime, or time owed to the employer which is especially useful if you have a flexitime scheme in place.

If you forget to clock in an activity, you can also go back retrospectively and edit your records.

|                          View Time Screen                          |                          Edit Time Screen                          |
| :----------------------------------------------------------------: | :----------------------------------------------------------------: |
| ![Timesheet View screen](./.github/screenshots/timesheet_view.jpg) | ![Timesheet Edit screen](./.github/screenshots/timesheet_edit.jpg) |

#### Security Disclaimer

When you navigate to `/timesheet` for the first time and your IP address is not recognised yet, you will be prompted to select a user, and that entry is written to the database. IP addresses can be spoofed, don't deploy this code in an exposed environment, or where you don't trust your users.
In its current design, it is designed for my partner and myself.

## Deployment Prerequisites

- PM2 Installed
  - `npm install pm2 -g`
  - Job with id=0 being this web server instance
- Postgres instance with rights to create a database
- `.env` file in project root (development) or `~/.env` in production containing:
  - POSTGRES_USER
  - POSTGRES_HOST
  - POSTGRES_DATABASE
  - POSTGRES_PASSWORD

## Start docker containers

Filebrowser: `docker run -d --name filebrowser -p 5000:8080 --user $(id -u):$(id -g) -v /home/joel/filebrowser/files:/data -v /home/joel/filebrowser/branding:/config/branding -e FB_BASEURL="/files" --restart unless-stopped hurlenko/filebrowser`

Castblock: `docker run --rm --network host erdnaxeli/castblock --restart unless-stopped`
