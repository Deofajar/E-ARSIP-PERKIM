import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArsipDto {
  @IsString()
  @IsNotEmpty()
  nomorSurat: string;

  @IsString()
  @IsNotEmpty()
  perihal: string;

  @IsString()
  @IsNotEmpty()
  kategori: string;

  @IsDateString()
  tanggalSurat: string;

  @IsString()
  @IsOptional()
  storageLocation?: string;
}
