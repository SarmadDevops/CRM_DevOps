import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CentrifugoService {
  private readonly logger = new Logger(CentrifugoService.name);
  private readonly apiUrl = 'http://localhost:9000/api';
  private readonly apiKey = 'centrifugo_api_key_change_this';

  async publish(channel: string, data: any) {
    try {
      await axios.post(
        this.apiUrl,
        { method: 'publish', params: { channel, data } },
        { headers: { Authorization: `apikey ${this.apiKey}` } },
      );
    } catch (error) {
      this.logger.error(`Centrifugo publish error: ${error.message}`);
    }
  }

  generateToken(userId: string, tenantId: string): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { sub: userId, tenant_id: tenantId },
      'centrifugo_secret_change_this',
      { expiresIn: '24h' },
    );
  }
}