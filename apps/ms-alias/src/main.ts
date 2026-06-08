import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for frontend integration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'alias',
      protoPath: join(__dirname, '../../shared-proto/alias.proto'),
      url: '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
void bootstrap();
