FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias para node-gyp (por si kafkajs/bcrypt etc lo necesitan, aunque kafkajs es puro js)
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Puerto MS-05 Evidence Vault
EXPOSE 3008

CMD ["npm", "run", "start:prod"]
