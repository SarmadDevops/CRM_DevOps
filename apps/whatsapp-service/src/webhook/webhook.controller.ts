import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private whatsappService: WhatsappService) {}

  // Meta webhook verification
  @Get('whatsapp/:tenantId')
  verifyWebhook(
    @Param('tenantId') tenantId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'my_verify_token_123';

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log(`Webhook verified for tenant: ${tenantId}`);
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden');
  }

  // Receive incoming WhatsApp messages
  @Post('whatsapp/:tenantId')
  async receiveMessage(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    this.logger.log(`Incoming WhatsApp message for tenant: ${tenantId}`);
    
    // Always respond 200 immediately to Meta
    res.status(200).send('OK');

    // Process message asynchronously
    await this.whatsappService.handleIncomingMessage(tenantId, body);
  }

  // Send message (called from Agent portal)
  @Post('whatsapp/:tenantId/send')
  async sendMessage(
    @Param('tenantId') tenantId: string,
    @Body() body: { conversation_id: string; text: string },
  ) {
    return this.whatsappService.sendMessage(
      tenantId,
      body.conversation_id,
      body.text,
    );
  }
}