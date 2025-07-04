/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtUser } from '../types/jwt-user.interface';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles('admin', 'store')
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'store')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'store')
  create(@Body() data: CreateSubscriptionDto, @Req() req: { user: JwtUser }) {
    return this.subscriptionsService.create({
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      storeId: data.storeId,
    }, req.user);
  }

  @Put(':id')
  @Roles('admin', 'store')
  update(
    @Param('id') id: string,
    @Body() data: UpdateSubscriptionDto,
    @Req() req: { user: JwtUser },
  ) {
    // Convertir fechas si vienen como string
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    return this.subscriptionsService.update(id, updateData, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'store')
  remove(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.subscriptionsService.remove(id, req.user);
  }

  @Get(':id/payments')
  @Roles('admin', 'store')
  async getPayments(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.subscriptionsService.getPayments(id, req.user);
  }
}
