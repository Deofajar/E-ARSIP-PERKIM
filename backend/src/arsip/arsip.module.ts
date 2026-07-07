import { Module } from '@nestjs/common';
import { ArsipService } from './arsip.service';
import { ArsipController } from './arsip.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArsipController],
  providers: [ArsipService],
})
export class ArsipModule {}
