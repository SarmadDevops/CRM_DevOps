import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {}

  async findAll() {
    return this.tenantRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(data: {
  name: string;
  slug: string;
  plan?: string;
  max_agents?: number;
  admin_email: string;
  admin_password: string;
}) {
  // Check slug is unique
  const existing = await this.tenantRepo.findOne({
    where: { slug: data.slug },
  });
  if (existing) throw new ConflictException('Slug already taken');

  // Hash admin password
  const hash = await bcrypt.hash(data.admin_password, 10);

  const tenant = this.tenantRepo.create({
    name: data.name,
    slug: data.slug,
    plan: data.plan || 'starter',
    max_agents: data.max_agents || 5,
    db_schema: `tenant_${data.slug}`,
    admin_email: data.admin_email,
    admin_password_hash: hash,
    status: 'trial',
  });

  const saved = await this.tenantRepo.save(tenant);

  // Auto create admin user in users table
  await this.autoCreateAdminUser(
    saved.id,
    data.admin_email,
    data.admin_password,
  );

  return saved;
}

private async autoCreateAdminUser(
  tenantId: string,
  email: string,
  password: string,
) {
  try {
    const hash = await bcrypt.hash(password, 10);
    await this.tenantRepo.manager.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, name, role, status, is_active, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, 'Admin', 'admin', 'offline', true, NOW())
       ON CONFLICT (email) DO NOTHING`,
      [tenantId, email, hash],
    );
    console.log(`✅ Admin user auto-created for tenant: ${tenantId}`);
  } catch (error) {
    console.log('Admin user creation skipped:', error.message);
  }
}

  async suspend(id: string) {
    await this.findOne(id);
    await this.tenantRepo.update(id, { status: 'suspended' });
    return { message: 'Tenant suspended' };
  }

  async activate(id: string) {
    await this.findOne(id);
    await this.tenantRepo.update(id, { status: 'active' });
    return { message: 'Tenant activated' };
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);
    await this.tenantRepo.remove(tenant);
    return { message: 'Tenant deleted' };
  }
}