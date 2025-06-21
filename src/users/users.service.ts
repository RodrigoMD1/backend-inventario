import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: [
        'id', 'email', 'role', 'isActive', 'plan', 'productsUsed', 'lastLogin'
      ]
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id', 'email', 'role', 'isActive', 'plan', 'productsUsed', 'lastLogin'
      ]
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async setActive(id: number, isActive: boolean) {
    await this.userRepository.update(id, { isActive });
    return this.findOne(id);
  }
}
