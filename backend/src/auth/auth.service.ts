import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface AuthenticatedUser {
  id: string;
  nip: string;
  namaLengkap: string;
  role: string;
  isActive: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    nip: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByNip(nip);
    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      nip: user.nip,
      namaLengkap: user.namaLengkap,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async login(
    nip: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: { id: string; nip: string; namaLengkap: string; role: string };
  }> {
    const user = await this.validateUser(nip, password);
    if (!user) {
      throw new UnauthorizedException('NIP atau password salah');
    }

    const payload: JwtPayload = {
      sub: user.id,
      nip: user.nip,
      namaLengkap: user.namaLengkap,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nip: user.nip,
        namaLengkap: user.namaLengkap,
        role: user.role,
      },
    };
  }
}
