import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Subscription } from './subscription.entity';
import { ApiKey } from './api-key.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToMany(() => ApiKey, (apiKey) => apiKey.store)
  apiKeys: ApiKey[];
}
