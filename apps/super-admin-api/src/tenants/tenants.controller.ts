import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantsService } from './tenants.service';

class CreateTenantDto {
  name: string;
  slug: string;
  plan: string;
  max_agents: number;
  admin_email: string;
  admin_password: string;
}

@Controller('tenants')
@UseGuards(AuthGuard('jwt'))
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTenantDto) {
    return this.tenantsService.create(body);
  }

  @Put(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.tenantsService.suspend(id);
  }

  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.tenantsService.activate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}