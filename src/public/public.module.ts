import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Store } from '../entities/store.entity';
import { PublicController } from './public.controller';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Store]),
    ApiKeysModule
  ],
  controllers: [PublicController],
})
export class PublicModule {}
