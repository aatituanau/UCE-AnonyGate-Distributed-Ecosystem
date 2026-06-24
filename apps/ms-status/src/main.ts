import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  // Use the Socket.IO Adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('MS-Status API')
    .setDescription('The Status and Notifications microservice API for AnonyGate')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('status/api/docs', app, document);

  // Note: Kafka, RabbitMQ, and MQTT clients are instantiated within their respective adapter classes
  // via OnModuleInit, so we don't need app.connectMicroservice() here unless we expose gRPC/TCP endpoints.

  const port = process.env.PORT || 3006;
  await app.listen(port);
  logger.log(`ms-status is running on port ${port}`);
}
bootstrap();
