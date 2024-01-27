FROM node:20

WORKDIR /app
ENV NODE_ENV production

COPY . .

RUN npm install --no-audit --no-cache

RUN ls -a && ls -a node_modules/drizzl-ekit && node_modulesnpm run build

EXPOSE 3000

CMD ["npm", "start"]
