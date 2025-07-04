import { Controller, Post, Body, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { Store } from '../entities/store.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() body: { name: string }, @Req() req: { user: { userId: string } }) {
    console.log('Usuario autenticado en /stores:', req.user);
    const user = await this.userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const store = this.storeRepository.create({ name: body.name, user: user });
    await this.storeRepository.save(store);
    console.log('Tienda creada:', store);
    return store;
  }
}
