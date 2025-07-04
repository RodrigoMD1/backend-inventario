import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string; // pending, paid, failed

  @Column({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Subscription, (subscription) => subscription.payments)
  subscription: Subscription;
}
