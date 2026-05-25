FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY src ./src

EXPOSE 3301

CMD ["npm", "start"]
