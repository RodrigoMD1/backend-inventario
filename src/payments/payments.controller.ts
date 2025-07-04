/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtUser } from '../types/jwt-user.interface';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles('admin', 'store')
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'store')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'store')
  create(@Body() data: CreatePaymentDto, @Req() req: { user: JwtUser }) {
    return this.paymentsService.create({
      ...data,
      subscription: { id: data.subscriptionId } as any,
      date: new Date(data.date),
    }, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'store')
  remove(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.paymentsService.remove(id, req.user);
  }
}
