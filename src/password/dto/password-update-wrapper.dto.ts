import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePasswordDto } from './create-password.dto';

export class PasswordUpdateWrapperDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePasswordDto)
  @ApiPropertyOptional({ type: () => CreatePasswordDto })
  update?: CreatePasswordDto;
}
