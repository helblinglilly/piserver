FROM node:latest
ENV NODE_ENV=production
COPY ./dashboard ./
WORKDIR ./dashboard
ENV POSTGRES_USER=postgres
ENV POSTGRES_DATABASE=homeserver_production
ENV POSTGRES_HOST=192.168.0.10
RUN export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD)
RUN npm ci
EXPOSE 8080
CMD node .