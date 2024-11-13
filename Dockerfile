# Use Node.js image
FROM node:18-alpine

WORKDIR /ui

COPY package.json package-lock.json ./

COPY . .

RUN npm install
# RUN npm run buil  d

EXPOSE 3000

# CMD ["npm", "run", "dev"]
CMD ["node", ".output/server/index.mjs"]
