chmod +x ./install-docker.sh
sudo ./install-docker.sh
mv strawberry-docker-compose.yaml ~/docker-compose.yaml

cd ~
docker compose up -d