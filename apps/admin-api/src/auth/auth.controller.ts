import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

class LoginDto {
  email: string;
  password: string;
  tenant_id: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(
      body.email,
      body.password,
      body.tenant_id,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req) {
    return req.user;
  }
}