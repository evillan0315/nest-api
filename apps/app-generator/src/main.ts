import { NestFactory } from '@nestjs/core';
import { AppGeneratorModule } from './app-generator.module';

async function bootstrap() {
  const app = await NestFactory.create(AppGeneratorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
