import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { Store } from '../entities/store.entity';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAll() {
    return this.subscriptionRepository.find({ relations: ['store'] });
  }

  async findOne(id: string) {
    return this.subscriptionRepository.findOne({ where: { id }, relations: ['store'] });
  }

  async create(
    data: { status: string; startDate: Date; endDate?: Date; storeId: string },
    user: { userId: string; role: string }
  ) {
    if (!data.storeId) {
      throw new NotFoundException('No se proporcionó tienda válida para la suscripción');
    }
    const store = await this.storeRepository.findOne({ where: { id: data.storeId }, relations: ['user'] });
    if (!store) throw new NotFoundException('Tienda no encontrada');
    if (user.role !== 'admin' && store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes crear suscripciones para esta tienda');
    }
    const subscription = this.subscriptionRepository.create({
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      store: store,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async update(id: string, data: Partial<Subscription>, user: { userId: string; role: string }) {
    const subscription = await this.subscriptionRepository.findOne({ where: { id }, relations: ['store'] });
    if (!subscription) throw new NotFoundException('Suscripción no encontrada');
    if (user.role !== 'admin' && subscription.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes modificar esta suscripción');
    }
    await this.subscriptionRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string, user: { userId: string; role: string }) {
    const subscription = await this.subscriptionRepository.findOne({ where: { id }, relations: ['store'] });
    if (!subscription) throw new NotFoundException('Suscripción no encontrada');
    if (user.role !== 'admin' && subscription.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes eliminar esta suscripción');
    }
    return this.subscriptionRepository.delete(id);
  }

  async getPayments(subscriptionId: string, user: { userId: string; role: string }) {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId }, relations: ['store'] });
    if (!subscription) throw new NotFoundException('Suscripción no encontrada');
    if (user.role !== 'admin' && subscription.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes ver los pagos de esta suscripción');
    }
    return this.paymentRepository.find({ where: { subscription: { id: subscriptionId } } });
  }
}
