import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
  ) {}

  async findAll(tenantId: string) {
    return this.channelRepo.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async create(tenantId: string, data: {
    type: string;
    name: string;
    credentials: object;
  }) {
    const channel = this.channelRepo.create({
      tenant_id: tenantId,
      type: data.type,
      name: data.name,
      credentials: data.credentials,
      webhook_url: `https://yourdomain.com/webhooks/${data.type}/${tenantId}`,
    });
    return this.channelRepo.save(channel);
  }

  async remove(id: string, tenantId: string) {
    const channel = await this.channelRepo.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    await this.channelRepo.remove(channel);
    return { message: 'Channel disconnected' };
  }
}