import { Controller, Get } from '@nestjs/common';
import { FilemanagerService } from './filemanager.service';

@Controller()
export class FilemanagerController {
  constructor(private readonly filemanagerService: FilemanagerService) {}

  @Get()
  getHello(): string {
    return this.filemanagerService.getHello();
  }
}
