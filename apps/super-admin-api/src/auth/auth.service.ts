import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SuperAdmin } from './super-admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SuperAdmin)
    private superAdminRepo: Repository<SuperAdmin>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Find super admin
    const admin = await this.superAdminRepo.findOne({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.superAdminRepo.update(admin.id, {
      last_login_at: new Date(),
    });

    // Generate JWT
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: 'super_admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  async seedSuperAdmin() {
    // Check if any super admin exists
    const count = await this.superAdminRepo.count();
    if (count > 0) return;

    // Create default super admin
    const hash = await bcrypt.hash('Admin@123', 10);
    const admin = this.superAdminRepo.create({
      email: 'admin@crm.com',
      password_hash: hash,
      name: 'Super Admin',
    });

    await this.superAdminRepo.save(admin);
    console.log('✅ Default super admin created: admin@crm.com / Admin@123');
  }

  async validateToken(payload: any) {
    return await this.superAdminRepo.findOne({
      where: { id: payload.sub },
    });
  }
}