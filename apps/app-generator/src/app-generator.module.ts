import { Module } from '@nestjs/common';
import { AppGeneratorController } from './app-generator.controller';
import { AppGeneratorService } from './app-generator.service';

@Module({
  imports: [],
  controllers: [AppGeneratorController],
  providers: [AppGeneratorService],
})
export class AppGeneratorModule {}
