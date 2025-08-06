import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { Store } from '../entities/store.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtUser } from '../types/jwt-user.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async createApiKey(storeId: string, user: JwtUser, data: CreateApiKeyDto) {
    // Verificar que la tienda pertenezca al usuario
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      relations: ['user']
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (store.user.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para crear API Keys en esta tienda');
    }

    // Generar una clave API única
    const apiKey = this.generateApiKey();

    // Crear la API Key
    const newApiKey = this.apiKeyRepository.create({
      key: apiKey,
      name: data.name,
      description: data.description,
      allowedDomains: data.allowedDomains ? JSON.stringify(data.allowedDomains) : undefined,
      store: store
    });

    return this.apiKeyRepository.save(newApiKey);
  }

  async getApiKeysByStore(storeId: string, user: JwtUser) {
    // Verificar que la tienda pertenezca al usuario
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      relations: ['user']
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (store.user.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para ver las API Keys de esta tienda');
    }

    return this.apiKeyRepository.find({
      where: { store: { id: storeId } },
      order: { createdAt: 'DESC' }
    });
  }

  async validateApiKey(key: string, domain?: string, ip?: string): Promise<{ isValid: boolean; store?: Store; apiKey?: ApiKey }> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key, isActive: true },
      relations: ['store']
    });

    if (!apiKey) {
      return { isValid: false };
    }

    // Verificar dominio permitido si está configurado
    if (apiKey.allowedDomains && domain) {
      const allowedDomains = JSON.parse(apiKey.allowedDomains) as string[];
      if (!allowedDomains.includes(domain) && !allowedDomains.includes('*')) {
        return { isValid: false };
      }
    }

    // Actualizar métricas de uso
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Resetear contadores si es necesario
    let requestsToday = apiKey.requestsToday;
    let requestsThisMonth = apiKey.requestsThisMonth;

    if (apiKey.lastUsed) {
      const lastUsedDate = new Date(apiKey.lastUsed.getFullYear(), apiKey.lastUsed.getMonth(), apiKey.lastUsed.getDate());
      if (lastUsedDate < today) {
        requestsToday = 0;
      }

      const lastUsedMonth = new Date(apiKey.lastUsed.getFullYear(), apiKey.lastUsed.getMonth(), 1);
      if (lastUsedMonth < thisMonth) {
        requestsThisMonth = 0;
      }
    }

    // Actualizar contador de uso y métricas
    await this.apiKeyRepository.update(apiKey.id, {
      requestCount: apiKey.requestCount + 1,
      requestsToday: requestsToday + 1,
      requestsThisMonth: requestsThisMonth + 1,
      lastUsed: now,
      lastDomain: domain,
      lastIP: ip
    });

    return { isValid: true, store: apiKey.store, apiKey };
  }

  async deleteApiKey(apiKeyId: string, user: JwtUser) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
      relations: ['store', 'store.user']
    });

    if (!apiKey) {
      throw new NotFoundException('API Key no encontrada');
    }

    if (apiKey.store.user.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta API Key');
    }

    return this.apiKeyRepository.delete(apiKeyId);
  }

  async toggleApiKey(apiKeyId: string, user: JwtUser) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
      relations: ['store', 'store.user']
    });

    if (!apiKey) {
      throw new NotFoundException('API Key no encontrada');
    }

    if (apiKey.store.user.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta API Key');
    }

    await this.apiKeyRepository.update(apiKeyId, {
      isActive: !apiKey.isActive
    });

    return this.apiKeyRepository.findOne({ where: { id: apiKeyId } });
  }

  async getApiKeyStats(apiKeyId: string, user: JwtUser) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
      relations: ['store', 'store.user']
    });

    if (!apiKey) {
      throw new NotFoundException('API Key no encontrada');
    }

    if (apiKey.store.user.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para ver las estadísticas de esta API Key');
    }

    return {
      id: apiKey.id,
      name: apiKey.name,
      isActive: apiKey.isActive,
      stats: {
        totalRequests: apiKey.requestCount,
        requestsToday: apiKey.requestsToday,
        requestsThisMonth: apiKey.requestsThisMonth,
        lastUsed: apiKey.lastUsed,
        lastDomain: apiKey.lastDomain,
        lastIP: apiKey.lastIP
      },
      limits: {
        rateLimit: apiKey.rateLimit,
        allowedDomains: apiKey.allowedDomains ? JSON.parse(apiKey.allowedDomains) as string[] : null
      },
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt
    };
  }

  async updateRateLimit(apiKeyId: string, rateLimit: number, user: JwtUser) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
      relations: ['store', 'store.user']
    });

    if (!apiKey) {
      throw new NotFoundException('API Key no encontrada');
    }

    if (apiKey.store.user.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta API Key');
    }

    if (rateLimit < 1 || rateLimit > 1000) {
      throw new BadRequestException('El rate limit debe estar entre 1 y 1000 requests por hora');
    }

    await this.apiKeyRepository.update(apiKeyId, { rateLimit });

    return this.apiKeyRepository.findOne({ where: { id: apiKeyId } });
  }

  private generateApiKey(): string {
    const prefix = 'sk_';
    const randomString = randomBytes(32).toString('hex');
    return prefix + randomString;
  }
}
