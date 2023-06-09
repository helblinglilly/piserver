FROM arm64v8/node:18-alpine AS base

WORKDIR /app
COPY . .

# Install depdendencies and build app
RUN npm install
RUN npm run build

ENV NODE_ENV production
EXPOSE 3000

RUN chmod +x entrypoint.sh
CMD [ "./entrypoint.sh"]
