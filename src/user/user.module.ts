import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordModule } from '../password/password.module';

@Module({
  imports: [PrismaModule, PasswordModule],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService],
})
export class UserModule {}
