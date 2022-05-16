FROM node:latest
ENV NODE_ENV=production
COPY . ./
RUN npm install husky --save-dev -g
ENV POSTGRES_USER=postgres
ENV POSTGRES_DATABASE=homeserver_production
ENV POSTGRES_HOST=0.0.0.0
RUN export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD)
RUN npm ci
EXPOSE 8080
CMD node .