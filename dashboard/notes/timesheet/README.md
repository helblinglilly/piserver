## Timesheet datetime storage

### Database

Store day_date (YYYY-MM-DD) in date format that's localised to the host
Store time (hh:mm:ss) in date format that's localised to the host

### Business logic (Host side)

Construct JS Date objects from host. By default, this makes all time operations in UTC

### Business logic (Client side)

Receive dates in UTC, and convert them to localised strings when displaying them
