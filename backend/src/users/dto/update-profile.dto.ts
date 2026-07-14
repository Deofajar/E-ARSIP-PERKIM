import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  noTelepon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  unitKerja?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jabatan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  instansi?: string;
}
