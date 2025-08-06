import { Controller, Get, Param, Query, Headers, BadRequestException, ForbiddenException, NotFoundException, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from '../api-keys/api-keys.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Store } from '../entities/store.entity';

@Controller('public')
export class PublicController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  @Get('products')
  async getProducts(
    @Query('api_key') apiKey: string,
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string,
    @Req() req?: Request
  ) {
    if (!apiKey) {
      throw new BadRequestException('API Key es requerida');
    }

    // Extraer dominio e IP del request
    const domain = this.extractDomain(origin || referer);
    const clientIP = req?.ip || req?.socket?.remoteAddress || 'unknown';

    // Validar API Key
    const validation = await this.apiKeyService.validateApiKey(apiKey, domain, clientIP);
    if (!validation.isValid || !validation.store) {
      throw new ForbiddenException('API Key inválida o dominio no autorizado');
    }

    // Configurar paginación
    const pageSize = Math.min(limit || 20, 100); // Máximo 100 productos por página
    const pageNumber = Math.max(page || 1, 1);
    const skip = (pageNumber - 1) * pageSize;

    // Construir query
    const where: any = {
      store: { id: validation.store.id },
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    // Obtener productos
    const [products, total] = await this.productRepository.findAndCount({
      where,
      relations: ['store'],
      order: { createdAt: 'DESC' }, // Ordenar por fecha de creación más reciente
      take: pageSize,
      skip
    });

    // Formatear respuesta
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description,
      image: product.image,
      unit: product.unit,
      storeName: product.store.name
    }));

    return {
      products: formattedProducts,
      pagination: {
        total,
        page: pageNumber,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: pageNumber < Math.ceil(total / pageSize),
        hasPrev: pageNumber > 1
      },
      store: {
        id: validation.store.id,
        name: validation.store.name
      }
    };
  }

  @Get('product/:id')
  async getProduct(
    @Param('id') productId: string,
    @Query('api_key') apiKey: string,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string
  ) {
    if (!apiKey) {
      throw new BadRequestException('API Key es requerida');
    }

    // Extraer dominio del origin o referer
    const domain = this.extractDomain(origin || referer);

    // Validar API Key
    const validation = await this.apiKeyService.validateApiKey(apiKey, domain);
    if (!validation.isValid || !validation.store) {
      throw new ForbiddenException('API Key inválida o dominio no autorizado');
    }

    // Buscar producto
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
        store: { id: validation.store.id },
        isActive: true
      },
      relations: ['store']
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description,
      image: product.image,
      unit: product.unit,
      cost: product.cost,
      store: {
        id: product.store.id,
        name: product.store.name
      }
    };
  }

  @Get('categories')
  async getCategories(
    @Query('api_key') apiKey: string,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string
  ) {
    if (!apiKey) {
      throw new BadRequestException('API Key es requerida');
    }

    // Extraer dominio del origin o referer
    const domain = this.extractDomain(origin || referer);

    // Validar API Key
    const validation = await this.apiKeyService.validateApiKey(apiKey, domain);
    if (!validation.isValid || !validation.store) {
      throw new ForbiddenException('API Key inválida o dominio no autorizado');
    }

    // Obtener categorías únicas
    const categories = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.storeId = :storeId', { storeId: validation.store.id })
      .andWhere('product.isActive = true')
      .andWhere('product.category IS NOT NULL')
      .andWhere('product.category != :empty', { empty: '' })
      .getRawMany();

    return {
      categories: categories.map(c => c.category).filter(Boolean),
      store: {
        id: validation.store.id,
        name: validation.store.name
      }
    };
  }

  @Get('store-info')
  async getStoreInfo(
    @Query('api_key') apiKey: string,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string
  ) {
    if (!apiKey) {
      throw new BadRequestException('API Key es requerida');
    }

    // Extraer dominio del origin o referer
    const domain = this.extractDomain(origin || referer);

    // Validar API Key
    const validation = await this.apiKeyService.validateApiKey(apiKey, domain);
    if (!validation.isValid || !validation.store) {
      throw new ForbiddenException('API Key inválida o dominio no autorizado');
    }

    // Obtener estadísticas básicas
    const totalProducts = await this.productRepository.count({
      where: {
        store: { id: validation.store.id },
        isActive: true
      }
    });

    const totalCategories = await this.productRepository
      .createQueryBuilder('product')
      .select('COUNT(DISTINCT product.category)', 'count')
      .where('product.storeId = :storeId', { storeId: validation.store.id })
      .andWhere('product.isActive = true')
      .andWhere('product.category IS NOT NULL')
      .andWhere('product.category != :empty', { empty: '' })
      .getRawOne();

    return {
      store: {
        id: validation.store.id,
        name: validation.store.name,
        isActive: validation.store.isActive
      },
      stats: {
        totalProducts,
        totalCategories: parseInt(totalCategories.count) || 0
      }
    };
  }

  private extractDomain(url?: string): string | undefined {
    if (!url) return undefined;
    
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return undefined;
    }
  }
}
