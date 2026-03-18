import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true, nullable: true })
  subdomain: string;

  @Column({ default: 'starter' })
  plan: string;

  @Column({ default: 'trial' })
  status: string;

  @Column({ default: 5 })
  max_agents: number;

  @Column({ default: 3 })
  max_channels: number;

  @Column()
  db_schema: string;

  @Column({ nullable: true })
  admin_email: string;

  @Column({ nullable: true })
  admin_password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  expires_at: Date;
}