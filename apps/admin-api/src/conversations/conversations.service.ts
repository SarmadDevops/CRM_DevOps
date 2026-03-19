import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './conversation.schema';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async findAll(tenantId: string, status?: string) {
    const filter: any = { tenant_id: tenantId };
    if (status) filter.status = status;

    return this.conversationModel
      .find(filter)
      .sort({ last_message_at: -1 })
      .limit(50);
  }

  async findOne(id: string, tenantId: string) {
    const conversation = await this.conversationModel.findOne({
      _id: id,
      tenant_id: tenantId,
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async getMessages(conversationId: string, tenantId: string) {
    await this.findOne(conversationId, tenantId);
    return this.messageModel
      .find({ conversation_id: conversationId, tenant_id: tenantId })
      .sort({ createdAt: 1 });
  }

  async sendMessage(
    conversationId: string,
    tenantId: string,
    agentId: string,
    text: string,
  ) {
    const conversation = await this.findOne(conversationId, tenantId);

    // Save outbound message
    const message = await this.messageModel.create({
      tenant_id: tenantId,
      conversation_id: conversationId,
      channel_type: conversation.channel_type,
      direction: 'outbound',
      type: 'text',
      content: { text },
      sender_id: agentId,
      status: 'sent',
    });

    // Update conversation last message
    await this.conversationModel.updateOne(
      { _id: conversationId },
      {
        last_message_at: new Date(),
        last_message_text: text,
      },
    );

    return message;
  }

  async assign(conversationId: string, tenantId: string, agentId: string) {
    await this.findOne(conversationId, tenantId);
    await this.conversationModel.updateOne(
      { _id: conversationId, tenant_id: tenantId },
      { assigned_agent_id: agentId },
    );
    return { message: 'Conversation assigned' };
  }

  async resolve(conversationId: string, tenantId: string) {
    await this.findOne(conversationId, tenantId);
    await this.conversationModel.updateOne(
      { _id: conversationId, tenant_id: tenantId },
      { status: 'resolved' },
    );
    return { message: 'Conversation resolved' };
  }

  async reopen(conversationId: string, tenantId: string) {
    await this.findOne(conversationId, tenantId);
    await this.conversationModel.updateOne(
      { _id: conversationId, tenant_id: tenantId },
      { status: 'open' },
    );
    return { message: 'Conversation reopened' };
  }
}