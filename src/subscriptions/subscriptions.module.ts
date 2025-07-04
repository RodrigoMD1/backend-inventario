import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../entities/subscription.entity';
import { Store } from '../entities/store.entity';
import { Payment } from '../entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Store, Payment])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
