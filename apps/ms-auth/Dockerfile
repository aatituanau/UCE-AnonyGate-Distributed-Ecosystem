# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev && npm cache clean --force
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD sh -c "npx prisma db push && npm run start:prod"
