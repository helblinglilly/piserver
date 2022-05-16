FROM node:latest
ENV NODE_ENV=production
ENV POSTGRES_USER=postgres
ENV POSTGRES_DATABASE=homeserver_production
ENV POSTGRES_HOST=192.168.0.10
COPY ./dashboard ./
WORKDIR ./dashboard
RUN npm install
EXPOSE 8080
CMD node .