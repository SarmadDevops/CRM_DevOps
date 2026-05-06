import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenant_id: string;

  @Column()
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  credentials: any;

  @Column({ default: true })
  is_active: boolean;
}