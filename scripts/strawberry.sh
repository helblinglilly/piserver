chmod +x ./install-docker.sh
sudo ./install-docker.sh
mv strawberry-docker-compose.yaml ~/docker-compose.yaml

cd ~
docker compose up -d

(crontab -l ; echo "0 * * * * curl http://192.168.0.11/api/jobs/energy") | crontab -