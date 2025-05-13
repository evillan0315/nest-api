import { Test, TestingModule } from '@nestjs/testing';
import { FormSchemaController } from './form-schema.controller';
import { FormSchemaService } from './form-schema.service';

describe('FormSchemaController', () => {
  let controller: FormSchemaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormSchemaController],
      providers: [FormSchemaService],
    }).compile();

    controller = module.get<FormSchemaController>(FormSchemaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
