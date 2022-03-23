#!/bin/bash
docker run -d -p 1234:9443 -p 2345:8000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:2.11.1