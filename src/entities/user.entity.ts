import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Store } from './store.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'store' }) // 'admin' o 'store'
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  plan: string;

  @Column({ default: 0 })
  productsUsed: number;

  @Column({ nullable: true })
  lastLogin: Date;

  @OneToMany(() => Store, (store) => store.user)
  stores: Store[];
}
