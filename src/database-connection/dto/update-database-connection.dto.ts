import { PartialType } from '@nestjs/swagger';
import { CreateDatabaseConnectionDto } from './create-database-connection.dto';

export class UpdateDatabaseConnectionDto extends PartialType(CreateDatabaseConnectionDto) {}

