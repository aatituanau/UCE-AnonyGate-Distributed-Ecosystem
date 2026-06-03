FROM node:20-alpine

WORKDIR /app

# 1. Copy dependencies files
COPY package*.json ./

# 2. Install dependencies
RUN npm install

# 4. Copy all the source code of the microservice
COPY . .

# 5. Compile the TypeScript code to JavaScript
RUN npm run build

# 6. Expose the port by where NestJS listens
EXPOSE 3001

# 7. Command to start the server in Production mode
CMD ["npm", "run", "start:prod"]
