import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

function toSafeUser(user: User) {
  return {
    id: user.id,
    nip: user.nip,
    namaLengkap: user.namaLengkap,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    email: user.email,
    noTelepon: user.noTelepon,
    unitKerja: user.unitKerja,
    jabatan: user.jabatan,
    instansi: user.instansi,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

type AuthedRequest = Request & { user: JwtPayload };

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(toSafeUser);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto, @Req() req: AuthedRequest) {
    const user = await this.usersService.create(createUserDto);
    await this.usersService.logActivity(
      req.user.sub,
      'Menambah pengguna baru',
      user.namaLengkap,
    );
    return toSafeUser(user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    this.assertSelfOrAdmin(id, req);
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new ForbiddenException('Pengguna tidak ditemukan');
    }
    return toSafeUser(user);
  }

  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @Req() req: AuthedRequest,
  ) {
    this.assertSelfOrAdmin(id, req);
    const user = await this.usersService.updateProfile(id, dto);
    return toSafeUser(user);
  }

  @Get(':id/activities')
  async findActivities(@Param('id') id: string, @Req() req: AuthedRequest) {
    this.assertSelfOrAdmin(id, req);
    return this.usersService.findActivities(id);
  }

  private assertSelfOrAdmin(targetId: string, req: AuthedRequest) {
    if (req.user.sub !== targetId && req.user.role !== 'admin') {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke data pengguna ini',
      );
    }
  }
}
