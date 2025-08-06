import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { JwtUser } from '../types/jwt-user.interface';
import { Store } from '../entities/store.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async findAll() {
    return this.productRepository.find({ relations: ['store'] });
  }

  async findOne(id: string) {
    return this.productRepository.findOne({ where: { id }, relations: ['store'] });
  }

  async create(data: Partial<Product> & { storeId?: string }) {
    // Si se proporciona un storeId explícito, usarlo
    if (data.storeId) {
      console.log('Usando storeId proporcionado por el frontend:', data.storeId);
      const store = await this.storeRepository.findOne({ where: { id: data.storeId } });
      if (!store) {
        throw new NotFoundException(`La tienda con ID ${data.storeId} no existe`);
      }
      
      // Usar la tienda encontrada
      const product = this.productRepository.create({
        ...data,
        store: store
      });
      return this.productRepository.save(product);
    } else {
      // Comportamiento original si no hay storeId específico
      console.log('Usando store proporcionado por el controller');
      const product = this.productRepository.create(data);
      return this.productRepository.save(product);
    }
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
    return this.productRepository.find({ where: { store: { user: { id: userId } } }, relations: ['store'] });
  }

  async findOneProtected(id: string, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store', 'store.user'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (user.role !== 'admin' && product.store.user.id !== user.userId) {
      throw new ForbiddenException('No tienes acceso a este producto');
    }
    return product;
  }

  async updateProtected(id: string, data: Partial<Product>, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store', 'store.user'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes modificar este producto');
    }
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  async setActiveProtected(id: string, isActive: boolean, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store', 'store.user'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes modificar este producto');
    }
    await this.productRepository.update(id, { isActive });
    return this.findOne(id);
  }

  async removeProtected(id: string, user: JwtUser) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['store', 'store.user'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.store.user.id !== user.userId) {
      throw new ForbiddenException('No puedes eliminar este producto');
    }
    return this.productRepository.delete(id);
  }
}
