import { Module } from '@nestjs/common';
import { ApiKeyService } from './apiKey.service';
import { ApiKeyController } from './apiKey.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
})
export class ApiKeyModule {}
