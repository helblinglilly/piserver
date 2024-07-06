FROM node:20

WORKDIR /app
ENV NODE_ENV production

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --no-audit

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
