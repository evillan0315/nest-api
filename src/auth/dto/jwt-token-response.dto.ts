import { ApiProperty } from '@nestjs/swagger';

export class JwtTokenResponseDto {
  @ApiProperty({ description: 'Refresh Token' })
  refreshToken: string | null;
}
