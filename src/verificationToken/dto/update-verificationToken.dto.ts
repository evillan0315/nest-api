import { PartialType } from '@nestjs/swagger';
import { CreateVerificationTokenDto } from './create-verificationToken.dto';

export class UpdateVerificationTokenDto extends PartialType(
  CreateVerificationTokenDto,
) {}
