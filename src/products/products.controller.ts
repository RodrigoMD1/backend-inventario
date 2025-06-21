/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtUser } from '../types/jwt-user.interface';
import { User } from 'src/entities/user.entity';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('admin', 'store')
  findAll(@Req() req: { user: JwtUser }) {
    // Si es admin, puede ver todos; si es store, solo los suyos
    if (req.user.role === 'admin') {
      return this.productsService.findAll();
    } else {
      return this.productsService.findByUser(req.user.userId);
    }
  }

  @Get(':id')
  @Roles('admin', 'store')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: JwtUser }) {
    return this.productsService.findOneProtected(id, req.user);
  }

  @Post()
  @Roles('store')
  create(@Body() data: CreateProductDto, @Req() req: { user: JwtUser }) {
    return this.productsService.create({ ...data, store: {
        id: req.user.userId,
        name: '',
        isActive: false,
        user: new User,
        products: [],
        subscriptions: []
    } });
  }

  @Put(':id')
  @Roles('store')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateProductDto, @Req() req: { user: JwtUser }) {
    return this.productsService.updateProtected(id, data, req.user);
  }

  @Patch(':id/active')
  @Roles('store')
  setActive(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean, @Req() req: { user: JwtUser }) {
    return this.productsService.setActiveProtected(id, isActive, req.user);
  }

  @Delete(':id')
  @Roles('store')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: JwtUser }) {
    return this.productsService.removeProtected(id, req.user);
  }
}
