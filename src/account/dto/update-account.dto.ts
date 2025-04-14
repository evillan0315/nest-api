import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
export class RefreshAccountDto extends PartialType(UpdateAccountDto) {}
