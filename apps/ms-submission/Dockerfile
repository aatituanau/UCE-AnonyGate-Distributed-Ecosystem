FROM node:20-alpine

WORKDIR /app

# 1. Copy dependencies files
COPY package*.json ./
COPY prisma ./prisma/

# 2. Install dependencies
RUN npm install

# 3. Generate the Prisma client for the Database (into src/generated/prisma)
RUN npx prisma generate

# 3.1 Copy shared-proto
COPY shared-proto /shared-proto

# 4. Copy all the source code of the microservice
COPY . .

# 5. Compile the TypeScript code to JavaScript
RUN npm run build && npm cache clean --force && rm -rf /root/.npm

# 6. Expose the port by where NestJS listens
EXPOSE 3003

# 7. Command to start the server in Production mode
CMD sh -c "npx prisma db push --schema=prisma/schema.prisma && npm run start:prod"
