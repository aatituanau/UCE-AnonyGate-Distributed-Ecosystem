import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS to allow requests from Frontend
  app.enableCors();

  // Global pipe for automatic DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('MS-Evidence API')
    .setDescription('The Evidence Vault microservice API for AnonyGate')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('evidence/api/docs', app, document);

  // The port defined by architecture is 3008
  const port = process.env.PORT || 3008;
  await app.listen(port);
  logger.log(`ms-evidence is running on port ${port}`);
}
void bootstrap();
