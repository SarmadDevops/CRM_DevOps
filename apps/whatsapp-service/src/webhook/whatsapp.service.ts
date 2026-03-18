import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Conversation, ConversationDocument } from '../conversations/conversation.schema';
import { Message, MessageDocument } from '../messages/message.schema';
import { Channel } from '../conversations/channel.entity';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
  ) {}

  async handleIncomingMessage(tenantId: string, body: any) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages) {
        this.logger.log('No messages in webhook payload');
        return;
      }

      const message = value.messages[0];
      const contact = value.contacts?.[0];
      const waId = message.from;
      const contactName = contact?.profile?.name || waId;

      // Find channel for this tenant
      const channel = await this.channelRepo.findOne({
        where: { tenant_id: tenantId, type: 'whatsapp', is_active: true },
      });

      if (!channel) {
        this.logger.warn(`No WhatsApp channel found for tenant: ${tenantId}`);
        return;
      }

      // Find or create conversation
      let conversation = await this.conversationModel.findOne({
        tenant_id: tenantId,
        contact_wa_id: waId,
        status: { $in: ['open', 'pending'] },
      });

      if (!conversation) {
        conversation = await this.conversationModel.create({
          tenant_id: tenantId,
          channel_id: channel.id,
          channel_type: 'whatsapp',
          contact_wa_id: waId,
          contact_name: contactName,
          contact_phone: waId,
          status: 'open',
          last_message_at: new Date(),
          last_message_text: this.extractMessageText(message),
        });
        this.logger.log(`New conversation created: ${conversation._id}`);
      } else {
        // Update last message
        await this.conversationModel.updateOne(
          { _id: conversation._id },
          {
            last_message_at: new Date(),
            last_message_text: this.extractMessageText(message),
          },
        );
      }

      // Save message
      await this.messageModel.create({
        tenant_id: tenantId,
        conversation_id: conversation._id.toString(),
        channel_type: 'whatsapp',
        direction: 'inbound',
        type: message.type,
        content: this.extractMessageContent(message),
        sender_id: waId,
        sender_name: contactName,
        status: 'received',
        external_id: message.id,
        wa_message_id: message.id,
      });

      this.logger.log(`Message saved for conversation: ${conversation._id}`);

    } catch (error) {
      this.logger.error('Error handling incoming message:', error);
    }
  }

  async sendMessage(tenantId: string, conversationId: string, text: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const channel = await this.channelRepo.findOne({
      where: { tenant_id: tenantId, type: 'whatsapp', is_active: true },
    });

    if (!channel) throw new Error('WhatsApp channel not configured');

    const creds = channel.credentials as any;

    // Send via Meta Cloud API
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${creds.phone_number_id}/messages`,
      {
        messaging_product: 'whatsapp',
        to: conversation.contact_wa_id,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${creds.access_token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Save outbound message
    await this.messageModel.create({
      tenant_id: tenantId,
      conversation_id: conversationId,
      channel_type: 'whatsapp',
      direction: 'outbound',
      type: 'text',
      content: { text },
      status: 'sent',
      external_id: response.data.messages?.[0]?.id,
    });

    return { success: true, message_id: response.data.messages?.[0]?.id };
  }

  private extractMessageText(message: any): string {
    if (message.type === 'text') return message.text?.body || '';
    if (message.type === 'image') return '📷 Image';
    if (message.type === 'audio') return '🎵 Audio';
    if (message.type === 'video') return '🎥 Video';
    if (message.type === 'document') return '📄 Document';
    return 'Message';
  }

  private extractMessageContent(message: any): object {
    if (message.type === 'text') return { text: message.text?.body };
    if (message.type === 'image') return { media_url: message.image?.id, caption: message.image?.caption };
    if (message.type === 'audio') return { media_url: message.audio?.id };
    if (message.type === 'document') return { media_url: message.document?.id, filename: message.document?.filename };
    return {};
  }
}