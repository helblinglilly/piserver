FROM arm64v8/node:18 AS base

WORKDIR /app

# Install dependencies
COPY package.json .
COPY package-lock.json .

RUN npm install

# Create prod build
COPY . .
ENTRYPOINT [ "npm", "run", "dev" ]
# RUN npx prisma generate
# RUN npm run build
# ENV NODE_ENV production

# EXPOSE 3000
# RUN chmod +x entrypoint.sh
# ENTRYPOINT [ "npm", "start" ]
