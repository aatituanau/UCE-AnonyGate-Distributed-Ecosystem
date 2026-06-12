import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('MS-Submission API')
    .setDescription('Complaint Submission Microservice')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/complaints/docs', app, document);

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
