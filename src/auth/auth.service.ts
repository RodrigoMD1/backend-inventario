import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: { email: string; password: string }) {
    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({ email: dto.email, password: hash });
    await this.userRepository.save(user);
    return { message: 'Usuario registrado correctamente' };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
