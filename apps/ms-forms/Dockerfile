# Stage 1: Build the NestJS application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production image without devDependencies
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Clean install only production dependencies
RUN npm install --omit=dev && npm cache clean --force
# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# MS-03 Dynamic Forms Service port
EXPOSE 3004

# Run the production build
CMD ["npm", "run", "start:prod"]
