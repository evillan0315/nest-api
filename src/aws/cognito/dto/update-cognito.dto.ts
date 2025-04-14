import { PartialType } from '@nestjs/swagger';
import { CreateCognitoDto } from './create-cognito.dto';

export class UpdateCognitoDto extends PartialType(CreateCognitoDto) {}
