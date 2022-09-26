#!/bin/bash
# install docker
sudo apt update
sudo apt install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

# setup file structure
mkdir ~/filebrowser
mkdir ~/filebrowser/files

mkdir ~/filebrowser/files/joel
mkdir ~/filebrowser/files/harry
mkdir ~/filebrowser/files/plex
mkdir ~/filebrowser/files/shared

mkdir ~/filebrowser/files/plex/config
mkdir ~/filebrowser/files/plex/tvshows
mkdir ~/filebrowser/files/plex/movies
mkdir ~/filebrowser/files/plex/music
mkdir ~/filebrowser/files/plex/videos

cp -R ~/piserver/filebrowser_config ~/filebrowser/config

# Copy docker compose
cp ~/piserver/docker-compose.yaml ~/docker-compose.yaml

echo "Now please set up filebrowser"
cd ~filebrowser/config

# some useless edit

