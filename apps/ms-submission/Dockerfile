# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY shared-proto /shared-proto
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev && npm cache clean --force
RUN npx prisma generate
COPY shared-proto /shared-proto
COPY --from=builder /app/dist ./dist
EXPOSE 3003
CMD sh -c "npx prisma db push --schema=prisma/schema.prisma && npm run start:prod"
