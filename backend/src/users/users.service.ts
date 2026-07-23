import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, User, UserActivity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByNip(nip: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { nip } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
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

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    try {
      return await this.prisma.user.update({ where: { id }, data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Pengguna tidak ditemukan');
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan pada server. Gagal memperbarui profil.',
      );
    }
  }

  async logActivity(
    userId: string,
    action: string,
    details?: string,
  ): Promise<void> {
    await this.prisma.userActivity.create({
      data: { userId, action, details },
    });
  }

  async findActivities(userId: string): Promise<UserActivity[]> {
    return this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  async remove(id: string): Promise<void> {
    let deletedUser: User;
    try {
      deletedUser = await this.prisma.user.delete({ where: { id } });
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

    // Best-effort: a notification failure should never mask a successful deletion.
    this.notificationsService
      .create({
        type: 'user_deleted',
        title: 'Pengguna dihapus',
        message: `Admin menghapus pengguna ${deletedUser.namaLengkap}`,
        linkId: null,
      })
      .catch(() => undefined);
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

    const user = await this.prisma.user.create({
      data: {
        nip: createUserDto.nip,
        namaLengkap: createUserDto.namaLengkap,
        password: hashedPassword,
        role: createUserDto.role ?? 'staf',
      },
    });

    // Best-effort: a notification failure should never mask a successful user creation.
    this.notificationsService
      .create({
        type: 'user',
        title: 'Pengguna baru ditambahkan',
        message: `Admin menambahkan pengguna ${user.namaLengkap}`,
        linkId: null,
      })
      .catch(() => undefined);

    return user;
  }
}
