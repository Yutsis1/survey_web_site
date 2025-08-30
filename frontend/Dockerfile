FROM node:22-trixie-slim

# layer for packages
WORKDIR /app

COPY package*.json ./

RUN npm install --production

# app layer

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
