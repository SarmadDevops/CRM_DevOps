import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

class CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: string;
}

class UpdateUserDto {
  name?: string;
  role?: string;
  is_active?: boolean;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.user.tenant_id);
  }

  @Post()
  create(@Body() body: CreateUserDto, @Request() req) {
    return this.usersService.create(req.user.tenant_id, body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.tenant_id);
  }
}