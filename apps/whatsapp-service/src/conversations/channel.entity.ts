import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenant_id: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  credentials: any;

  @Column({ nullable: true })
  webhook_url: string;

  @Column({ default: true })
  is_active: boolean;
}