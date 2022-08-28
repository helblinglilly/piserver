FROM node:latest
ENV NODE_ENV=production
ENV POSTGRES_USER=postgres
ENV POSTGRES_DATABASE=homeserver
ENV POSTGRES_HOST=192.168.0.10
WORKDIR /dashboard
COPY ./dashboard/package.json package.json
COPY ./dashboard/package-lock.json package-lock.json
RUN npm ci
COPY ./dashboard/. .
EXPOSE 8080
CMD ["node", "."]