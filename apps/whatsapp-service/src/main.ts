import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(4001);
  console.log('WhatsApp Service running on http://localhost:4001');
}

bootstrap().catch(console.error);