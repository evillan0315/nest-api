import { PartialType } from '@nestjs/swagger';
import { CreateApiKeyDto } from './create-apiKey.dto';

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {}
