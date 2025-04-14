import { NestFactory } from '@nestjs/core';
import { FilemanagerModule } from './filemanager.module';

async function bootstrap() {
  const app = await NestFactory.create(FilemanagerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
