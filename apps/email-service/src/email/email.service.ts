import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Conversation, ConversationDocument } from '../conversations/conversation.schema';
import { Message, MessageDocument } from '../conversations/message.schema';
import { Channel } from '../conversations/channel.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
  ) {}

  async handleIncomingEmail(tenantId: string, emailData: {
    from: string;
    fromName: string;
    subject: string;
    text: string;
    html: string;
    messageId: string;
  }) {
    try {
      this.logger.log(`Incoming email for tenant: ${tenantId} from: ${emailData.from}`);

      const channel = await this.channelRepo.findOne({
        where: { tenant_id: tenantId, type: 'email', is_active: true },
      });

      if (!channel) {
        this.logger.warn(`No email channel for tenant: ${tenantId}`);
        return;
      }

      // Find or create conversation
      let conversation = await this.conversationModel.findOne({
        tenant_id: tenantId,
        contact_email: emailData.from,
        channel_type: 'email',
        status: { $in: ['open', 'pending'] },
      });

      if (!conversation) {
        conversation = await this.conversationModel.create({
          tenant_id: tenantId,
          channel_id: channel.id,
          channel_type: 'email',
          contact_email: emailData.from,
          contact_name: emailData.fromName || emailData.from,
          subject: emailData.subject,
          status: 'open',
          last_message_at: new Date(),
          last_message_text: emailData.text?.substring(0, 100),
        });
        this.logger.log(`New email conversation: ${conversation._id}`);
      } else {
        await this.conversationModel.updateOne(
          { _id: conversation._id },
          {
            last_message_at: new Date(),
            last_message_text: emailData.text?.substring(0, 100),
          },
        );
      }

      // Save message
      await this.messageModel.create({
        tenant_id: tenantId,
        conversation_id: conversation._id.toString(),
        channel_type: 'email',
        direction: 'inbound',
        type: 'email',
        content: {
          text: emailData.text,
          html: emailData.html,
          subject: emailData.subject,
        },
        sender_email: emailData.from,
        sender_name: emailData.fromName,
        status: 'received',
        external_id: emailData.messageId,
      });

      this.logger.log(`Email message saved for conversation: ${conversation._id}`);

    } catch (error) {
      this.logger.error('Email handling error:', error);
    }
  }

  async sendEmail(tenantId: string, conversationId: string, text: string, subject?: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const channel = await this.channelRepo.findOne({
      where: { tenant_id: tenantId, type: 'email', is_active: true },
    });

    if (!channel) throw new Error('Email channel not configured');

    const creds = channel.credentials as any;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: creds.smtp_host,
      port: creds.smtp_port || 587,
      secure: creds.smtp_port === 465,
      auth: {
        user: creds.smtp_user,
        pass: creds.smtp_pass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `${creds.from_name} <${creds.smtp_user}>`,
      to: conversation.contact_email,
      subject: subject || `Re: ${conversation.subject}`,
      text,
    });

    // Save outbound message
    await this.messageModel.create({
      tenant_id: tenantId,
      conversation_id: conversationId,
      channel_type: 'email',
      direction: 'outbound',
      type: 'email',
      content: { text, subject },
      sender_email: creds.smtp_user,
      status: 'sent',
    });

    await this.conversationModel.updateOne(
      { _id: conversationId },
      { last_message_at: new Date(), last_message_text: text },
    );

    return { success: true };
  }
}