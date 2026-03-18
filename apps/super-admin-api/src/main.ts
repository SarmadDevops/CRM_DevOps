import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('super-admin/v1');

  const authService = app.get(AuthService);
  await authService.seedSuperAdmin();

  await app.listen(3000);
  console.log('Super Admin API running on http://localhost:3000/super-admin/v1');
}

bootstrap().catch(console.error);