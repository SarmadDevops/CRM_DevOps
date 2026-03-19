import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CentrifugoService } from './centrifugo.service';

@Controller('centrifugo')
@UseGuards(AuthGuard('jwt'))
export class CentrifugoController {
  constructor(private centrifugoService: CentrifugoService) {}

  @Get('token')
  getToken(@Request() req) {
    const token = this.centrifugoService.generateToken(
      req.user.id,
      req.user.tenant_id,
    );
    return { token };
  }
}