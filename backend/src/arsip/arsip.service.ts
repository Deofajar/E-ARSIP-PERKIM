import { join } from 'path';
import { existsSync } from 'fs';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateArsipDto } from './dto/create-arsip.dto';

@Injectable()
export class ArsipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateArsipDto, file: Express.Multer.File, uploaderId: string) {
    try {
      return await this.prisma.archive.create({
        data: {
          nomorSurat: dto.nomorSurat,
          perihal: dto.perihal,
          kategori: dto.kategori,
          tanggalSurat: new Date(dto.tanggalSurat),
          fileUrl: `/uploads/${file.filename}`,
          storageLocation: dto.storageLocation ?? '-',
          uploaderId,
        },
        include: { uploader: { select: { namaLengkap: true } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Nomor surat sudah terdaftar. Silakan gunakan nomor surat yang berbeda.',
        );
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan pada server. Gagal menyimpan arsip.',
      );
    }
  }

  async findAll(search?: string) {
    const where: Prisma.ArchiveWhereInput | undefined = search
      ? {
          OR: [
            { nomorSurat: { contains: search, mode: 'insensitive' } },
            { perihal: { contains: search, mode: 'insensitive' } },
            { kategori: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.archive.findMany({
      where,
      include: { uploader: { select: { namaLengkap: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const archive = await this.prisma.archive.findUnique({
      where: { id },
      include: { uploader: { select: { namaLengkap: true } } },
    });

    if (!archive) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    return archive;
  }

  async getDownloadPath(id: string, downloaderId: string): Promise<{ filePath: string; filename: string }> {
    const archive = await this.findOne(id);
    const filePath = join(__dirname, '..', '..', 'uploads', archive.fileUrl.replace('/uploads/', ''));

    if (!existsSync(filePath)) {
      throw new NotFoundException('Berkas tidak ditemukan di server');
    }

    await this.usersService.logActivity(
      downloaderId,
      'Mengunduh',
      archive.nomorSurat,
    );

    return { filePath, filename: `${archive.nomorSurat}.pdf` };
  }
}
