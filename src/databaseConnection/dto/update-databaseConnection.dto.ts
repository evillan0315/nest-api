import { PartialType } from '@nestjs/swagger';
import { CreateDatabaseConnectionDto } from './create-databaseConnection.dto';

export class UpdateDatabaseConnectionDto extends PartialType(
  CreateDatabaseConnectionDto,
) {}
