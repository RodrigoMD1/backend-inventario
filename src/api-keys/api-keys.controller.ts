import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiKeyService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtUser } from '../types/jwt-user.interface';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiKeysController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post(':storeId')
  @Roles('store')
  async createApiKey(
    @Param('storeId') storeId: string,
    @Body() data: CreateApiKeyDto,
    @Req() req: { user: JwtUser }
  ) {
    return this.apiKeyService.createApiKey(storeId, req.user, data);
  }

  @Get(':storeId')
  @Roles('store')
  async getApiKeys(
    @Param('storeId') storeId: string,
    @Req() req: { user: JwtUser }
  ) {
    return this.apiKeyService.getApiKeysByStore(storeId, req.user);
  }

  @Delete(':apiKeyId')
  @Roles('store')
  async deleteApiKey(
    @Param('apiKeyId') apiKeyId: string,
    @Req() req: { user: JwtUser }
  ) {
    return this.apiKeyService.deleteApiKey(apiKeyId, req.user);
  }

  @Patch(':apiKeyId/toggle')
  @Roles('store')
  async toggleApiKey(
    @Param('apiKeyId') apiKeyId: string,
    @Req() req: { user: JwtUser }
  ) {
    return this.apiKeyService.toggleApiKey(apiKeyId, req.user);
  }

  @Get(':apiKeyId/stats')
  @Roles('store')
  async getApiKeyStats(
    @Param('apiKeyId') apiKeyId: string,
    @Req() req: { user: JwtUser }
  ) {
    return this.apiKeyService.getApiKeyStats(apiKeyId, req.user);
  }

  @Patch(':apiKeyId/rate-limit')
  @Roles('store')
  async updateRateLimit(
    @Param('apiKeyId') apiKeyId: string,
    @Body() data: { rateLimit: number },
    @Req() req: { user: JwtUser }
  ) {
    return this.apiKeyService.updateRateLimit(apiKeyId, data.rateLimit, req.user);
  }
}
