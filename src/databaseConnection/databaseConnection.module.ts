import { Module } from '@nestjs/common';
import { DatabaseConnectionService } from './databaseConnection.service';
import { DatabaseConnectionController } from './databaseConnection.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatabaseConnectionController],
  providers: [DatabaseConnectionService],
})
export class DatabaseConnectionModule {}
