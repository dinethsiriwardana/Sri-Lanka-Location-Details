FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json .
COPY src ./src
COPY data ./data

RUN npm install
RUN npm run build

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid 10014 \
    "choreo"

    
USER 10014

EXPOSE 3000

CMD ["npm", "start"]