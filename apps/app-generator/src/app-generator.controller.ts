import { Controller, Get } from '@nestjs/common';
import { AppGeneratorService } from './app-generator.service';

@Controller()
export class AppGeneratorController {
  constructor(private readonly appGeneratorService: AppGeneratorService) {}

  @Get()
  getHello(): string {
    return this.appGeneratorService.getHello();
  }
}
