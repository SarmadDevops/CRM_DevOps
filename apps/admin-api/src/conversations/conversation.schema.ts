import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, index: true })
  tenant_id: string;

  @Prop({ required: true })
  channel_id: string;

  @Prop({ required: true })
  channel_type: string;

  @Prop({ required: true })
  contact_wa_id: string;

  @Prop()
  contact_name: string;

  @Prop()
  contact_phone: string;

  @Prop({ default: 'open' })
  status: string;

  @Prop({ default: 'normal' })
  priority: string;

  @Prop()
  assigned_agent_id: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  last_message_at: Date;

  @Prop()
  last_message_text: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);