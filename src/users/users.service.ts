import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface UserList {
  id: string; // UUID
  email: string;
  role: string;
  isActive: boolean;
  plan: string | null;
  productsUsed: number;
  lastLogin: Date | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserList[]> {
    return this.userRepository.find({
      select: [
        'id', 'email', 'role', 'isActive', 'plan', 'productsUsed', 'lastLogin'
      ]
    });
  }

  async findOne(id: string): Promise<UserList> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id', 'email', 'role', 'isActive', 'plan', 'productsUsed', 'lastLogin'
      ]
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async setActive(id: string, isActive: boolean): Promise<UserList> {
    await this.userRepository.update(id, { isActive });
    return this.findOne(id);
  }
}
