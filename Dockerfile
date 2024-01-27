FROM node:18

WORKDIR /app
ENV NODE_ENV production

COPY package*.json ./

RUN npm install --no-audit

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
