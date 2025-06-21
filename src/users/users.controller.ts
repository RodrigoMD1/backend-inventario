/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Param, ParseIntPipe, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/active')
  @Roles('admin')
  setActive(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.usersService.setActive(id, isActive);
  }
}
