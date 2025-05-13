import { PartialType } from '@nestjs/swagger';
import { CreateFormSchemaDto } from './create-form-schema.dto';

export class UpdateFormSchemaDto extends PartialType(CreateFormSchemaDto) {}

