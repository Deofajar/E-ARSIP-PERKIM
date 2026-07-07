import { randomUUID } from 'crypto';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const arsipMulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (
      _req: unknown,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype !== 'application/pdf') {
      callback(new BadRequestException('Hanya file PDF yang diperbolehkan'), false);
      return;
    }
    callback(null, true);
  },
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
};
