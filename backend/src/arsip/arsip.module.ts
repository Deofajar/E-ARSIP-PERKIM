import { Module } from '@nestjs/common';
import { ArsipService } from './arsip.service';
import { ArsipController } from './arsip.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, UsersModule, NotificationsModule],
  controllers: [ArsipController],
  providers: [ArsipService],
})
export class ArsipModule {}
