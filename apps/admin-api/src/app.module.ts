import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { ConversationsModule } from './conversations/conversations.module';
import { User } from './users/user.entity';
import { Channel } from './channels/channel.entity';

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
        entities: [User, Channel],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRoot(
      'mongodb://crm_admin:SuperSecret123@localhost:27017/crm_conversations?authSource=admin',
    ),
    AuthModule,
    UsersModule,
    ChannelsModule,
    ConversationsModule,
  ],
})
export class AppModule {}