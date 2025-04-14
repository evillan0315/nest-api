import { Module } from '@nestjs/common';
import { ComponentService } from './component.service';
import { ComponentController } from './component.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComponentController],
  providers: [ComponentService],
})
export class ComponentModule {}
