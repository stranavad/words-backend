FROM node:16-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY app.js ./
COPY views ./views
COPY .env ./

CMD ["node", "app.js"]