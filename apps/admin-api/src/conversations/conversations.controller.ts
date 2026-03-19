import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationsService } from './conversations.service';

class SendMessageDto {
  text: string;
}

class AssignDto {
  agent_id: string;
}

@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  findAll(@Request() req, @Query('status') status?: string) {
    return this.conversationsService.findAll(req.user.tenant_id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.conversationsService.findOne(id, req.user.tenant_id);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @Request() req) {
    return this.conversationsService.getMessages(id, req.user.tenant_id);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() body: SendMessageDto,
    @Request() req,
  ) {
    return this.conversationsService.sendMessage(
      id,
      req.user.tenant_id,
      req.user.id,
      body.text,
    );
  }

  @Put(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() body: AssignDto,
    @Request() req,
  ) {
    return this.conversationsService.assign(
      id,
      req.user.tenant_id,
      body.agent_id,
    );
  }

  @Put(':id/resolve')
  resolve(@Param('id') id: string, @Request() req) {
    return this.conversationsService.resolve(id, req.user.tenant_id);
  }

  @Put(':id/reopen')
  reopen(@Param('id') id: string, @Request() req) {
    return this.conversationsService.reopen(id, req.user.tenant_id);
  }
}