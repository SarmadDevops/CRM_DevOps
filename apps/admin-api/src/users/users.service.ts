import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(tenantId: string) {
    return this.userRepo.find({
      where: { tenant_id: tenantId },
      select: ['id', 'email', 'name', 'role', 'status', 'is_active', 'created_at'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.userRepo.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email, tenant_id: tenantId },
    });
    if (existing) throw new ConflictException('Email already exists');

    const hash = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      tenant_id: tenantId,
      email: data.email,
      password_hash: hash,
      name: data.name,
      role: data.role || 'agent',
    });

    const saved = await this.userRepo.save(user);
    const { password_hash, ...result } = saved;
    return result;
  }

  async update(id: string, tenantId: string, data: {
    name?: string;
    role?: string;
    is_active?: boolean;
  }) {
    await this.findOne(id, tenantId);
    await this.userRepo.update({ id, tenant_id: tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.userRepo.update(
      { id, tenant_id: tenantId },
      { is_active: false },
    );
    return { message: 'User deactivated' };
  }

  async seedAdminUser(tenantId: string, email: string, password: string) {
    const existing = await this.userRepo.findOne({
      where: { email, tenant_id: tenantId },
    });
    if (existing) return;

    const hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      tenant_id: tenantId,
      email,
      password_hash: hash,
      name: 'Admin',
      role: 'admin',
    });
    await this.userRepo.save(user);
    console.log(`✅ Admin user seeded: ${email}`);
  }
}