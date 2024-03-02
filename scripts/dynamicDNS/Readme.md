# Dynamic DNS

To keep Jellyfin working correctly, we need to setup a script that will keep updating a DNS entry to the current IP address

## Setup

Set this script up to run on a cron schedule

Keep a `dyndns.config` file next to the script - see the sample provided

Make sure that the `A` and `AAA` records already exist