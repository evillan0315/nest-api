import { Module } from '@nestjs/common';
import { ApiUsageService } from './api-usage.service';
import { ApiUsageController } from './api-usage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiUsageController],
  providers: [ApiUsageService]
})
export class ApiUsageModule {}

