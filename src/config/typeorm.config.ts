import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Product } from '../entities/product.entity';
import { Subscription } from '../entities/subscription.entity';
import { Payment } from '../entities/payment.entity';
import { ApiKey } from '../entities/api-key.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  username: 'postgres.smpozuhusjrexmycpljc',
  password: 'Comandante989796',
  database: 'postgres',
  entities: [User, Store, Product, Subscription, Payment, ApiKey],
  synchronize: true,
  ssl: { rejectUnauthorized: false },
};
