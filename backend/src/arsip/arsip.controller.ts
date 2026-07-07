import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ArsipService } from './arsip.service';
import { CreateArsipDto } from './dto/create-arsip.dto';
import { arsipMulterOptions } from './multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('arsip')
export class ArsipController {
  constructor(private readonly arsipService: ArsipService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.arsipService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arsipService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', arsipMulterOptions))
  create(
    @Body() createArsipDto: CreateArsipDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: JwtPayload },
  ) {
    if (!file) {
      throw new BadRequestException('File dokumen wajib diunggah');
    }
    return this.arsipService.create(createArsipDto, file, req.user.sub);
  }
}
