## Create a DB backup

Make sure that the version of `pg_dump` and `pg_restore` match the DB version.

Verify, by trying to run the tool, and then matching the version afterwards if required.

```sh
ssh raspberry.pi
/mnt/hdd/filebrowser/files/shared/admin/db_backups

pg_dump -U username -h host homeserver_production >> homeserver_production-2024-01-28.bak
```

## Restore from backup

```sh
ssh raspberry.pi
/mnt/hdd/filebrowser/files/shared/admin/db_backups

pg_restore -U username -d homeserver_production -h host -W homeserver_production-2024-01-28.bak
```

## Match Version

### macOS
```sh
pg_dump: error: server version: 15.3 (Debian 15.3-1.pgdg110+1); pg_dump version: 13.13 (Debian 13.13-0+deb11u1)
pg_dump: error: aborting because of server version mismatch


# Make sure the correct, major version of Postgres is installed. If not
brew install postgres@majorVersionNumber

sudo ln -s /usr/lib/postgresql/[required version]/bin/pg_dump /usr/bin/pg_dump --force
```


### Ubuntu

> Remember: The DB itself is running in a docker container! Local version might be different to what's actually being used
```sh
pg_dump: error: server version: 15.3 (Debian 15.3-1.pgdg110+1); pg_dump version: 13.13 (Debian 13.13-0+deb11u1)
pg_dump: error: aborting because of server version mismatch


# Make sure the correct, major version of Postgres is installed. If not
brew install postgres@majorVersionNumber

sudo ln -s /usr/lib/postgresql/[required version]/bin/pg_dump /usr/bin/pg_dump --force
```
