import { PartialType } from '@nestjs/swagger';
import { CreateApiUsageDto } from './create-apiUsage.dto';

export class UpdateApiUsageDto extends PartialType(CreateApiUsageDto) {}
