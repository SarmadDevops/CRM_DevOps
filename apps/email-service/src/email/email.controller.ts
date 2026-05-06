import {
  Controller,
  Post,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { EmailService } from './email.service';

class IncomingEmailDto {
  from: string;
  fromName: string;
  subject: string;
  text: string;
  html: string;
  messageId: string;
}

class SendEmailDto {
  text: string;
  subject?: string;
}

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private emailService: EmailService) {}

  @Post('incoming/:tenantId')
  async receiveEmail(
    @Param('tenantId') tenantId: string,
    @Body() body: IncomingEmailDto,
  ) {
    await this.emailService.handleIncomingEmail(tenantId, body);
    return { success: true };
  }

  @Post('send/:tenantId/:conversationId')
  async sendEmail(
    @Param('tenantId') tenantId: string,
    @Param('conversationId') conversationId: string,
    @Body() body: SendEmailDto,
  ) {
    return this.emailService.sendEmail(
      tenantId,
      conversationId,
      body.text,
      body.subject,
    );
  }
}