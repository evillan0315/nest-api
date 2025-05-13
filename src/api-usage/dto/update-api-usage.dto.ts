import { PartialType } from '@nestjs/swagger';
import { CreateApiUsageDto } from './create-api-usage.dto';

export class UpdateApiUsageDto extends PartialType(CreateApiUsageDto) {}

