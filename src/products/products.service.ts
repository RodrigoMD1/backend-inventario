import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { JwtUser } from '../types/jwt-user.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll() {
    return this.productRepository.find();
  }

  async findOne(id: string) {
    return this.productRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Product>) {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async update(id: string, data: Partial<Product>) {
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.productRepository.delete(id);
  }

  async setActive(id: string, isActive: boolean) {
    await this.productRepository.update(id, { isActive });
    return this.findOne(id);
  }

  async findByUser(userId: string) {
    return this.productRepository.find({ where: { store: { id: userId } } });
  }

  async findOneProtected(id: string, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (user.role !== 'admin' && product.store.id !== user.userId) {
      throw new ForbiddenException('No tienes acceso a este producto');
    }
    return product;
  }

  async updateProtected(id: string, data: Partial<Product>, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.store.id !== user.userId) {
      throw new ForbiddenException('No puedes modificar este producto');
    }
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  async setActiveProtected(id: string, isActive: boolean, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.store.id !== user.userId) {
      throw new ForbiddenException('No puedes modificar este producto');
    }
    await this.productRepository.update(id, { isActive });
    return this.findOne(id);
  }

  async removeProtected(id: string, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.store.id !== user.userId) {
      throw new ForbiddenException('No puedes eliminar este producto');
    }
    return this.productRepository.delete(id);
  }
}
