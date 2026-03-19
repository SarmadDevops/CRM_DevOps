import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Conversation, ConversationDocument } from '../conversations/conversation.schema';
import { Message, MessageDocument } from '../conversations/message.schema';
import { Channel } from '../conversations/channel.entity';

@Injectable()
export class FbInstaService {
  private readonly logger = new Logger(FbInstaService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
  ) {}

  async handleFacebookMessage(tenantId: string, body: any) {
    try {
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];
      if (!messaging?.message) return;

      const senderId = messaging.sender.id;
      const messageText = messaging.message.text;
      const messageId = messaging.message.mid;

      const channel = await this.channelRepo.findOne({
        where: { tenant_id: tenantId, type: 'facebook', is_active: true },
      });

      if (!channel) {
        this.logger.warn(`No Facebook channel for tenant: ${tenantId}`);
        return;
      }

      // Find or create conversation
      let conversation = await this.conversationModel.findOne({
        tenant_id: tenantId,
        contact_id: senderId,
        channel_type: 'facebook',
        status: { $in: ['open', 'pending'] },
      });

      if (!conversation) {
        conversation = await this.conversationModel.create({
          tenant_id: tenantId,
          channel_id: channel.id,
          channel_type: 'facebook',
          contact_id: senderId,
          contact_name: `FB User ${senderId}`,
          status: 'open',
          last_message_at: new Date(),
          last_message_text: messageText,
        });
        this.logger.log(`New FB conversation: ${conversation._id}`);
      } else {
        await this.conversationModel.updateOne(
          { _id: conversation._id },
          { last_message_at: new Date(), last_message_text: messageText },
        );
      }

      // Save message
      await this.messageModel.create({
        tenant_id: tenantId,
        conversation_id: conversation._id.toString(),
        channel_type: 'facebook',
        direction: 'inbound',
        type: 'text',
        content: { text: messageText },
        sender_id: senderId,
        status: 'received',
        external_id: messageId,
      });

    } catch (error) {
      this.logger.error('FB message error:', error);
    }
  }

  async handleInstagramMessage(tenantId: string, body: any) {
    try {
      this.logger.log(`Instagram message received for tenant: ${tenantId}`);
      this.logger.log(`Body: ${JSON.stringify(body)}`);

      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];

      this.logger.log(`Messaging: ${JSON.stringify(messaging)}`);

      if (!messaging?.message) return;

      const senderId = messaging.sender.id;
      const messageText = messaging.message.text;
      const messageId = messaging.message.mid;

      this.logger.log(`Looking for instagram channel for tenant: ${tenantId}`);

      const channel = await this.channelRepo.findOne({
        where: { tenant_id: tenantId, type: 'instagram', is_active: true },
      });

      this.logger.log(`Channel found: ${JSON.stringify(channel)}`);

      if (!channel) {
        this.logger.warn(`No Instagram channel for tenant: ${tenantId}`);
        return;
      }

      this.logger.log(`Looking for existing conversation for contact: ${senderId}`);

      let conversation = await this.conversationModel.findOne({
        tenant_id: tenantId,
        contact_id: senderId,
        channel_type: 'instagram',
        status: { $in: ['open', 'pending'] },
      });

      this.logger.log(`Existing conversation: ${JSON.stringify(conversation)}`);

      if (!conversation) {
        this.logger.log(`Creating new Instagram conversation...`);
        conversation = await this.conversationModel.create({
          tenant_id: tenantId,
          channel_id: channel.id,
          channel_type: 'instagram',
          contact_id: senderId,
          contact_name: `IG User ${senderId}`,
          status: 'open',
          last_message_at: new Date(),
          last_message_text: messageText,
        });
        this.logger.log(`New Instagram conversation created: ${conversation._id}`);
      } else {
        this.logger.log(`Updating existing conversation...`);
        await this.conversationModel.updateOne(
          { _id: conversation._id },
          { last_message_at: new Date(), last_message_text: messageText },
        );
      }

      this.logger.log(`Saving message...`);
      await this.messageModel.create({
        tenant_id: tenantId,
        conversation_id: conversation._id.toString(),
        channel_type: 'instagram',
        direction: 'inbound',
        type: 'text',
        content: { text: messageText },
        sender_id: senderId,
        status: 'received',
        external_id: messageId,
      });
      this.logger.log(`Message saved successfully!`);

    } catch (error) {
      this.logger.error('Instagram message error:', error);
    }
  }

  async sendFacebookReply(tenantId: string, recipientId: string, text: string) {
    const channel = await this.channelRepo.findOne({
      where: { tenant_id: tenantId, type: 'facebook', is_active: true },
    });
    if (!channel) throw new Error('Facebook channel not configured');

    const creds = channel.credentials as any;
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text },
      },
      {
        params: { access_token: creds.page_access_token },
      },
    );

    return { success: true };
  }
}