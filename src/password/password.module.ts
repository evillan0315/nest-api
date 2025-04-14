import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { PasswordController } from './password.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PasswordController],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
