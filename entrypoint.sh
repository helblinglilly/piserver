#!/bin/sh
echo "hello"
npx prisma db push --accept-data-loss
npm run start