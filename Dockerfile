FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY src ./src
COPY data ./data

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]