import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { FbInstaService } from './fb-insta.service';
import { Conversation, ConversationSchema } from '../conversations/conversation.schema';
import { Message, MessageSchema } from '../conversations/message.schema';
import { Channel } from '../conversations/channel.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    TypeOrmModule.forFeature([Channel]),
  ],
  controllers: [WebhookController],
  providers: [FbInstaService],
})
export class WebhookModule {}