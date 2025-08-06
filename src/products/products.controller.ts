/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Req, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtUser } from '../types/jwt-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  @Get()
  @Roles('admin', 'store')
  findAll(@Req() req: { user: JwtUser }) {
    // Si es admin, puede ver todos; si es store, solo los suyos
    if (req.user.role === 'admin') {
      return this.productsService.findAll();
    } else {
      return this.productsService.findByUser(String(req.user.userId));
    }
  }

  @Get(':id')
  @Roles('admin', 'store')
  findOne(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.productsService.findOneProtected(id, req.user);
  }

  @Post()
  @Roles('store')
  async create(@Body() data: CreateProductDto, @Req() req: { user: JwtUser }) {
    this.logger.log(`Creating product: ${JSON.stringify(data)}`);
    this.logger.log(`User info: ${JSON.stringify(req.user)}`);
    
    // Detectar si el frontend está enviando el userId como storeId (error común)
    if (data.storeId === req.user.userId) {
      this.logger.warn(`El frontend está enviando el userId como storeId. Buscando tiendas del usuario...`);
      
      // Buscar las tiendas del usuario
      const stores = await this.storeRepository.find({
        where: { user: { id: req.user.userId } }
      });
      
      if (!stores || stores.length === 0) {
        this.logger.error(`User ${req.user.userId} has no stores`);
        throw new Error('El usuario no tiene tiendas asociadas. Cree una tienda primero.');
      }
      
      // Usar la primera tienda del usuario y mostrar advertencia
      const storeId = stores[0].id;
      this.logger.log(`Corrigiendo automáticamente: usando la tienda ${storeId} del usuario`);
      
      const storesList = stores.map(s => `- ${s.name}: ${s.id}`).join('\n');
      this.logger.warn(`Tiendas disponibles para este usuario:\n${storesList}`);
      
      return this.productsService.create({
        ...data,
        storeId
      });
    }
    
    // Si viene un storeId en el DTO, verificar que la tienda pertenezca al usuario
    if (data.storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: data.storeId },
        relations: ['user']
      });
      
      if (!store) {
        // Buscar las tiendas del usuario para sugerir IDs correctos
        const stores = await this.storeRepository.find({
          where: { user: { id: req.user.userId } }
        });
        
        const storesList = stores.length > 0 
          ? `\n\nTiendas disponibles para este usuario:\n${stores.map(s => `- ${s.name}: ${s.id}`).join('\n')}`
          : '';
        
        this.logger.error(`Store with ID ${data.storeId} not found`);
        throw new Error(`La tienda con ID ${data.storeId} no existe. Debe proporcionar un ID de tienda válido.${storesList}`);
      }
      
      if (store.user.id !== req.user.userId) {
        this.logger.error(`User ${req.user.userId} does not own store ${data.storeId}`);
        throw new Error(`No tienes permisos para crear productos en esta tienda`);
      }
      
      this.logger.log(`Using store ID from frontend: ${data.storeId}`);
      return this.productsService.create(data);
    } else {
      // Si no viene storeId, buscar la tienda del usuario
      const stores = await this.storeRepository.find({
        where: { user: { id: req.user.userId } }
      });
      
      if (!stores || stores.length === 0) {
        this.logger.error(`User ${req.user.userId} has no stores`);
        throw new Error('El usuario no tiene tiendas asociadas. Cree una tienda primero.');
      }
      
      // Usar la primera tienda del usuario
      const storeId = stores[0].id;
      this.logger.log(`Using user's store: ${storeId}`);
      
      return this.productsService.create({
        ...data,
        storeId
      });
    }
  }

  @Put(':id')
  @Roles('store')
  update(@Param('id') id: string, @Body() data: UpdateProductDto, @Req() req: { user: JwtUser }) {
    return this.productsService.updateProtected(id, data, req.user);
  }

  @Patch(':id/active')
  @Roles('store')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean, @Req() req: { user: JwtUser }) {
    return this.productsService.setActiveProtected(id, isActive, req.user);
  }

  @Delete(':id')
  @Roles('store')
  remove(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.productsService.removeProtected(id, req.user);
  }

  // Método auxiliar para listar las tiendas disponibles del usuario
  private async listAvailableStoresForUser(userId: string): Promise<string> {
    const stores = await this.storeRepository.find({
      where: { user: { id: userId } }
    });
    
    if (!stores || stores.length === 0) {
      return 'Ninguna (debe crear una tienda primero)';
    }
    
    return stores.map(store => `${store.name} (ID: ${store.id})`).join(', ');
  }
}
