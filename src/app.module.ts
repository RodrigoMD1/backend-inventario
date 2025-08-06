import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { PublicModule } from './public/public.module';
import { typeOrmConfig } from './config/typeorm.config';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    StoresModule,
    ProductsModule,
    SubscriptionsModule,
    CommonModule,
    ConfigModule,
    ApiKeysModule,
    PublicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
