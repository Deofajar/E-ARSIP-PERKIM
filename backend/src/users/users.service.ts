import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
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

  async updateLastLogin(id: string, timestamp: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: timestamp },
    });
  }

  async remove(id: string): Promise<void> {
    const archiveCount = await this.prisma.archive.count({
      where: { uploaderId: id },
    });
    if (archiveCount > 0) {
      throw new ConflictException(
        'Tidak dapat menghapus pengguna karena masih memiliki arsip yang diunggah.',
      );
    }

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Pengguna tidak ditemukan');
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan pada server. Gagal menghapus pengguna.',
      );
    }
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
