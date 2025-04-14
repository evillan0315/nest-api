import { Module } from '@nestjs/common';
import { ApiUsageService } from './apiUsage.service';
import { ApiUsageController } from './apiUsage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiUsageController],
  providers: [ApiUsageService],
})
export class ApiUsageModule {}
