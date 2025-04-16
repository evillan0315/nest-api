import { Injectable } from '@nestjs/common';

@Injectable()
export class AppGeneratorService {
  getHello(): string {
    return 'Hello World!';
  }
}
