import { Test, TestingModule } from '@nestjs/testing';
import { AppGeneratorController } from './app-generator.controller';
import { AppGeneratorService } from './app-generator.service';

describe('AppGeneratorController', () => {
  let appGeneratorController: AppGeneratorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppGeneratorController],
      providers: [AppGeneratorService],
    }).compile();

    appGeneratorController = app.get<AppGeneratorController>(
      AppGeneratorController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appGeneratorController.getHello()).toBe('Hello World!');
    });
  });
});
