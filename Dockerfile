FROM arm64v8/node:slim
RUN npm install --save-dev typescript
ENV NODE_ENV=production
ENV POSTGRES_USER=postgres
ENV POSTGRES_DATABASE=homeserver
ENV POSTGRES_HOST=192.168.0.10

WORKDIR /app

COPY ./dashboard/package.json package.json
COPY ./dashboard/package-lock.json package-lock.json
RUN npm ci

COPY ./dashboard/. .
RUN npm run build
RUN rm -fr src

EXPOSE 8080
CMD ["npm", "run", "start"]