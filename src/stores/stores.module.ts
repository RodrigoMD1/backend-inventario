import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, User])],
  controllers: [StoresController],
  providers: [],
})
export class StoresModule {}
