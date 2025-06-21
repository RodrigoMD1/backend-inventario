import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Product } from '../entities/product.entity';
import { Subscription } from '../entities/subscription.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  username: 'postgres.smpozuhusjrexmycpljc',
  password: 'Comandante989796',
  database: 'postgres',
  entities: [User, Store, Product, Subscription],
  synchronize: true, // Solo para desarrollo
  ssl: { rejectUnauthorized: false }, // Habilitar SSL para Supabase
};
