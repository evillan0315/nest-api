import { Injectable } from '@nestjs/common';

@Injectable()
export class FilemanagerService {
  getHello(): string {
    return 'Hello World!';
  }
}
