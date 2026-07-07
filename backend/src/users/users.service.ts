import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByNip(nip: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { nip } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.findByNip(createUserDto.nip);
    if (existing) {
      throw new ConflictException('NIP sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );

    return this.prisma.user.create({
      data: {
        nip: createUserDto.nip,
        namaLengkap: createUserDto.namaLengkap,
        password: hashedPassword,
        role: createUserDto.role ?? 'staf',
      },
    });
  }
}
