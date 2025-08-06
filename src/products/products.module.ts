import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Store } from '../entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Store])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
