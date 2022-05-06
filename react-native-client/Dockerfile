FROM node:16.14

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json .
COPY app.json .

RUN npm install -g expo-cli
RUN npm install
COPY . .

EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

CMD ["npm", "run", "start"]