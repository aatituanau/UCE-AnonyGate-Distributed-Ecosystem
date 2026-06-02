FROM node:20-alpine

WORKDIR /app

# 1. Copy dependencies files
COPY package*.json ./
COPY prisma ./prisma/

# 2. Install dependencies
RUN npm install

# 3. Generate the Prisma client for the Database
RUN npx prisma generate

# 4. Copy all the source code of the microservice
COPY . .

# 5. Compile the TypeScript code to JavaScript
RUN npm run build

# 6. Expose the port by where NestJS listens
EXPOSE 3000

# 7. Command to start the server in Production mode
# Only push schema automatically, NEVER seed automatically to avoid overriding real data
CMD sh -c "npx prisma db push && npm run start:prod"
