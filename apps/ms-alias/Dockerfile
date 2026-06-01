FROM node:20-alpine

WORKDIR /app

# 1. Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instalar dependencias
RUN npm install

# 3. Generar el cliente de Prisma para la Base de Datos
RUN npx prisma generate

# 4. Copiar todo el código fuente del microservicio
COPY . .

# 5. Compilar el código de TypeScript a JavaScript
RUN npm run build

# 6. Exponer el puerto por donde escucha NestJS
EXPOSE 3000

# 7. Comando para arrancar el servidor en modo Producción
CMD ["npm", "run", "start:prod"]
