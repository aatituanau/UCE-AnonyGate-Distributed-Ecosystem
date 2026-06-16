import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Requisito: puerto 3009 para ms-admin
  await app.listen(process.env.PORT ?? 3009);
  console.log(`MS-Admin is running on: ${await app.getUrl()}`);
}
bootstrap();
