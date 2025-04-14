import { Test, TestingModule } from '@nestjs/testing';
import { FilemanagerController } from './filemanager.controller';
import { FilemanagerService } from './filemanager.service';

describe('FilemanagerController', () => {
  let filemanagerController: FilemanagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FilemanagerController],
      providers: [FilemanagerService],
    }).compile();

    filemanagerController = app.get<FilemanagerController>(
      FilemanagerController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(filemanagerController.getHello()).toBe('Hello World!');
    });
  });
});
