import { ApiProperty } from '@nestjs/swagger';

export class JwtTokenResponseDto {
  @ApiProperty({ description: 'User Id' })
  userId: string;

  @ApiProperty({ description: 'Access Token' })
  access_token: string | null;

  @ApiProperty({ description: 'Refresh Token' })
  refresh_token: string;
}
