import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  allowedDomains?: string; // JSON array of allowed domains

  @Column({ default: 0 })
  requestCount: number;

  @Column({ default: 0 })
  requestsToday: number;

  @Column({ default: 0 })
  requestsThisMonth: number;

  @Column({ nullable: true })
  lastUsed?: Date;

  @Column({ nullable: true })
  lastDomain?: string;

  @Column({ nullable: true })
  lastIP?: string;

  @Column({ default: 100 })
  rateLimit: number; // Requests per hour

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Store, (store) => store.apiKeys)
  store: Store;
}
