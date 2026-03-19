import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookModule } from './webhook/webhook.module';
import { Channel } from './conversations/channel.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      'mongodb://crm_admin:SuperSecret123@localhost:27017/crm_conversations?authSource=admin',
    ),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'crm_admin',
      password: 'SuperSecret123',
      database: 'crm_global',
      entities: [Channel],
      synchronize: false,
      logging: false,
    }),
    WebhookModule,
  ],
})
export class AppModule {}