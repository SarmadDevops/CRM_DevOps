import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(4003);
  console.log('Email Service running on http://localhost:4003');
}

bootstrap().catch(console.error);