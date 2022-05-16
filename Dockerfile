FROM node:latest
ENV NODE_ENV=production
COPY . ./
RUN npm install husky --save-dev -g
RUN npm ci
EXPOSE 8080
CMD node .