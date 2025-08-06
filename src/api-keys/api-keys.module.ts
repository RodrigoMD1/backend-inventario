import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { Store } from '../entities/store.entity';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeyService } from './api-keys.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, Store])],
  controllers: [ApiKeysController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeysModule {}
