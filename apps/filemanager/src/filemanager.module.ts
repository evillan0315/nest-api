import { Module } from '@nestjs/common';
import { FilemanagerController } from './filemanager.controller';
import { FilemanagerService } from './filemanager.service';

@Module({
  imports: [],
  controllers: [FilemanagerController],
  providers: [FilemanagerService],
})
export class FilemanagerModule {}
