FROM node:10.16.0-jessie

WORKDIR /app

COPY package.json /app

RUN yarn install

COPY . .

RUN yarn run build

WORKDIR /app/dist

EXPOSE 4000

CMD node ./index.js