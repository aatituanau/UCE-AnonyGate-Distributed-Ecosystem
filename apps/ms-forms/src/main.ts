import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS to allow frontend applications to query GraphQL
  app.enableCors();
  
  // Port 3004 as defined in Contexto_AnonyGate_v4.md
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`🚀 MS-03 (Dynamic Forms) is running on: http://localhost:${port}/graphql`);
}
bootstrap();
