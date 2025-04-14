import { Module } from '@nestjs/common';
import { VerificationTokenService } from './verificationToken.service';
import { VerificationTokenController } from './verificationToken.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VerificationTokenController],
  providers: [VerificationTokenService],
})
export class VerificationTokenModule {}
