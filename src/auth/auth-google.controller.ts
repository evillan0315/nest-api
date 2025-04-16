import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
//import { Roles } from '../admin/roles/roles.decorator';
//import { Role } from '../admin/roles/role.enum';
//import { RolesGuard } from '../admin/roles/roles.guard';
//import { CognitoGuard } from '../aws/cognito/cognito.guard';
import { GoogleAuthGuard } from './guards/google.guard'; // Add Google strategy for OAuth
import { AuthGoogleService } from './auth-google.service';
import { GoogleCallbackDto } from './dto/google-callback.dto';

//@ApiBearerAuth()
//@UseGuards(CognitoGuard, RolesGuard)
@ApiTags('Google Auth')
@Controller('api/auth/google')
export class AuthGoogleController {
  constructor(private readonly authGoogleService: AuthGoogleService) {}

  @Post('callback')
  @ApiOperation({ summary: 'Login using Google OAuth Code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Google OAuth authorization code from frontend redirect',
        },
      },
      required: ['code'],
    },
  })
  async googleCallback(@Body() body: GoogleCallbackDto) {
    const { code } = body;
    if (!code) {
      throw new HttpException('Missing code', HttpStatus.BAD_REQUEST);
    }

    try {
      const tokens =
        await this.authGoogleService.exchangeGoogleCodeForTokens(code);
      return { message: 'Login successful', ...tokens };
    } catch (error) {
      console.error('OAuth exchange failed:', error);
      throw new HttpException('Google login failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
