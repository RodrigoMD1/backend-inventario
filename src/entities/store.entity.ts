import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.stores)
  user: User;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Subscription, (subscription) => subscription.store)
  subscriptions: Subscription[];
}
