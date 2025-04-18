FROM --platform=linux/amd64 node:20-alpine3.18

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY ./ ./

RUN npm run build

COPY ./ ./

EXPOSE 4173

CMD ["npm", "run", "preview","--","--port","4173","--host"]