import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'crm_admin',
    password: 'SuperSecret123',
    database: 'crm_global',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  }),
  inject: [ConfigService],
}),
    AuthModule,
    TenantsModule,
  ],
})
export class AppModule {}