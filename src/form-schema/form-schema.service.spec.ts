import { Test, TestingModule } from '@nestjs/testing';
import { FormSchemaService } from './form-schema.service';

describe('FormSchemaService', () => {
  let service: FormSchemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormSchemaService],
    }).compile();

    service = module.get<FormSchemaService>(FormSchemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
