import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  // Seed admin user for test tenant
  const usersService = app.get(UsersService);
  await usersService.seedAdminUser(
    'e5a76350-b413-45bc-992e-111b9b540bc3',
    'admin@testcompany.com',
    'Test@123',
  );

  await app.listen(3001);
  console.log('Admin API running on http://localhost:3001/api/v1');
}

bootstrap().catch(console.error);