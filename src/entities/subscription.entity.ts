import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Store } from './store.entity';
import { Payment } from './payment.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string; // active, inactive, cancelled

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Store, (store) => store.subscriptions)
  store: Store;

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];
}
