import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  tenant_id: string;

  @Prop({ required: true, index: true })
  conversation_id: string;

  @Prop({ required: true })
  channel_type: string;

  @Prop({ required: true })
  direction: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object })
  content: {
    text?: string;
    html?: string;
    subject?: string;
    attachments?: any[];
  };

  @Prop()
  sender_id: string;

  @Prop()
  sender_name: string;

  @Prop()
  sender_email: string;

  @Prop({ default: 'sent' })
  status: string;

  @Prop()
  external_id: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);