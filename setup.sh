#!/bin/bash
echo "Running Setup"

if ! command -v pihole &> /dev/null
then
    echo "Installing pihole..."
    curl -sSL https://install.pi-hole.net | bash
fi

# This does not work yet, need to find out to check if Plex is installed
if ! command -v plex &> /dev/null
then
    echo "Installing Plex"
    curl https://downloads.plex.tv/plex-keys/PlexSign.key | sudo apt-key add -
    echo deb https://downloads.plex.tv/repo/deb public main | sudo tee /etc/apt/sources.list.d/plexmediaserver.list
    sudo apt update
    sudo apt install plexmediaserver
    sudo systemctl status plexmediaserver
fi

if ! command -v filebrowser &> /usr/local/bin/filebrowser
then
    echo "Installing File Browser"
    curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh | bash
    filebrowser -r /var/lib/filebrowser/
fi

if ! command -v psql &> /usr/bin/psql
then
    sudo apt install postgresql
    echo "Complete Postgres setup manually"
    sudo su postgres
    createuser admin -P --interactive
    logout
fi