import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('admin', 'store')
  findAll(@Req() req) {
    // Si es admin, puede ver todos; si es store, solo los suyos
    if (req.user.role === 'admin') {
      return this.productsService.findAll();
    } else {
      return this.productsService.findByUser(req.user.userId);
    }
  }

  @Get(':id')
  @Roles('admin', 'store')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productsService.findOneProtected(id, req.user);
  }

  @Post()
  @Roles('store')
  create(@Body() data: CreateProductDto, @Req() req) {
    return this.productsService.create({ ...data, store: { id: req.user.userId } });
  }

  @Put(':id')
  @Roles('store')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateProductDto, @Req() req) {
    return this.productsService.updateProtected(id, data, req.user);
  }

  @Patch(':id/active')
  @Roles('store')
  setActive(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean, @Req() req) {
    return this.productsService.setActiveProtected(id, isActive, req.user);
  }

  @Delete(':id')
  @Roles('store')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productsService.removeProtected(id, req.user);
  }
}
