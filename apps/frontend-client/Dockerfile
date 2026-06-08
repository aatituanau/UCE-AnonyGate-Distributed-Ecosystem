# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Copy config files and dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build the React/Vite application for production
RUN npm run build

# Stage 2: Production (Nginx)
FROM nginx:alpine

# Install bash for more robust scripts if necessary
RUN apk add --no-cache bash

# Clear default Nginx configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled files from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script for environment variables
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use the script as an entrypoint before starting Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
