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
import { FbInstaService } from './fb-insta.service';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private fbInstaService: FbInstaService) {}

  // Facebook webhook verification
  @Get('facebook/:tenantId')
  verifyFacebook(
    @Param('tenantId') tenantId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = process.env.FB_VERIFY_TOKEN || 'my_fb_verify_token_123';
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log(`FB webhook verified for tenant: ${tenantId}`);
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // Instagram webhook verification
  @Get('instagram/:tenantId')
  verifyInstagram(
    @Param('tenantId') tenantId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = process.env.FB_VERIFY_TOKEN || 'my_fb_verify_token_123';
    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // Receive Facebook messages
  @Post('facebook/:tenantId')
  async receiveFacebook(
   @Param('tenantId') tenantId: string,
   @Body() body: any,
   @Res() res: Response,
) {
  const payload = body;
  res.status(200).send('OK');
  await this.fbInstaService.handleFacebookMessage(tenantId, payload);
}
  // Receive Instagram messages
  @Post('instagram/:tenantId')
  async receiveInstagram(
   @Param('tenantId') tenantId: string,
   @Body() body: any,
   @Res() res: Response,
) {
  // Save body before sending response
  const payload = body;
  res.status(200).send('OK');
  await this.fbInstaService.handleInstagramMessage(tenantId, payload);
}
}