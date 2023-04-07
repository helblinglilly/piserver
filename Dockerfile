FROM arm64v8/node:18-alpine AS base

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

EXPOSE 3000

ENV NODE_ENV production
ENV PORT 3000

CMD ["npm", "run", "start"]
