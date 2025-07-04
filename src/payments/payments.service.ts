import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async findAll() {
    return this.paymentRepository.find({ relations: ['subscription'] });
  }

  async findOne(id: string) {
    return this.paymentRepository.findOne({ where: { id }, relations: ['subscription'] });
  }

  async create(data: Partial<Payment>, user: { userId: string; role: string }) {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: data.subscription?.id }, relations: ['store'] });
    if (!subscription) throw new NotFoundException('Suscripción no encontrada');
    if (user.role !== 'admin' && subscription.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes registrar pagos para esta suscripción');
    }
    const payment = this.paymentRepository.create({ ...data, subscription });
    return this.paymentRepository.save(payment);
  }

  async remove(id: string, user: { userId: string; role: string }) {
    const payment = await this.paymentRepository.findOne({ where: { id }, relations: ['subscription', 'subscription.store'] });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (user.role !== 'admin' && payment.subscription.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes eliminar este pago');
    }
    return this.paymentRepository.delete(id);
  }
}
