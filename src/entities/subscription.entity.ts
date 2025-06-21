import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Store } from './store.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string; // active, inactive, cancelled

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Store, (store) => store.subscriptions)
  store: Store;
}
