FROM arm64v8/node:18-alpine AS base

# Install cron, and add file with schedule + command
RUN apk add dcron
ADD crontab /etc/crontabs/root

WORKDIR /app
COPY . .

# Set up cronjob and start service
RUN chmod +x jobs.sh
RUN sh -c crond -f -l 8

# Install depdendencies and build app
RUN npm ci
RUN npm run build

# Run database migration
RUN npx prisma db push --accept-data-loss

ENV NODE_ENV production
EXPOSE 3000

CMD ["npm", "run", "start"]
