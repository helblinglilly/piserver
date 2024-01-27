FROM node:20

WORKDIR /app
ENV NODE_ENV production

COPY package*.json ./

RUN npm install --no-audit --no-cache

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
