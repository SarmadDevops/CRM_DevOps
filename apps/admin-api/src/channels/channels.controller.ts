import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChannelsService } from './channels.service';

class CreateChannelDto {
  type: string;
  name: string;
  credentials: object;
}

@Controller('channels')
@UseGuards(AuthGuard('jwt'))
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  findAll(@Request() req) {
    return this.channelsService.findAll(req.user.tenant_id);
  }

  @Post()
  create(@Body() body: CreateChannelDto, @Request() req) {
    return this.channelsService.create(req.user.tenant_id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.channelsService.remove(id, req.user.tenant_id);
  }
}