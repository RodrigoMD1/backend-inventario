import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../api-keys/api-keys.service';

interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
  };
}

@Injectable()
export class ApiKeyRateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly maxRequests = 100; // Máximo 100 requests por hora
  private readonly windowMs = 60 * 60 * 1000; // 1 hora en milisegundos

  constructor(private readonly apiKeyService: ApiKeyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.query.api_key as string;
    
    if (!apiKey) {
      return res.status(400).json({
        error: 'API Key is required',
        message: 'Por favor proporciona una API Key válida'
      });
    }

    // Validar API Key
    const domain = this.extractDomain(req.headers.origin as string || req.headers.referer as string);
    const validation = await this.apiKeyService.validateApiKey(apiKey, domain);
    
    if (!validation.isValid) {
      return res.status(401).json({
        error: 'Invalid API Key',
        message: 'La API Key proporcionada no es válida o el dominio no está autorizado'
      });
    }

    // Verificar rate limit
    const now = Date.now();
    const keyData = this.store[apiKey];

    if (!keyData || now > keyData.resetTime) {
      // Reiniciar contador si ha pasado la ventana de tiempo
      this.store[apiKey] = {
        requests: 1,
        resetTime: now + this.windowMs
      };
    } else {
      // Incrementar contador
      keyData.requests++;
      
      if (keyData.requests > this.maxRequests) {
        const resetInSeconds = Math.ceil((keyData.resetTime - now) / 1000);
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Has excedido el límite de ${this.maxRequests} requests por hora. Intenta nuevamente en ${resetInSeconds} segundos.`,
          retryAfter: resetInSeconds
        });
      }
    }

    // Agregar headers informativos
    const remaining = this.maxRequests - this.store[apiKey].requests;
    const resetInSeconds = Math.ceil((this.store[apiKey].resetTime - now) / 1000);
    
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetInSeconds);

    // Continuar con la petición
    next();
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
