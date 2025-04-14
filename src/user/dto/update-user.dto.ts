import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';

import { CreateUserDto } from './create-user.dto';
import { PasswordUpdateWrapperDto } from '../../password/dto/password-update-wrapper.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => PasswordUpdateWrapperDto)
  @ApiPropertyOptional({ type: () => PasswordUpdateWrapperDto })
  password?: PasswordUpdateWrapperDto;
}
