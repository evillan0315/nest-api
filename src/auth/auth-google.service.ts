import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { UserPayload } from './auth.interface';

@Injectable()
export class AuthGoogleService {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async exchangeGoogleCodeForTokens(code: string) {
    const url = 'https://oauth2.googleapis.com/token';
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('COGNITO_REDIRECT_URI');
    const params = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    const { data } = await axios.post(url, null, {
      params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, id_token } = data;

    // Optional: Verify token, get user info
    const userInfo = await this.getGoogleUserInfo(access_token);

    return {
      access_token,
      id_token,
      user: userInfo,
    };
  }

  async getGoogleUserInfo(token: string) {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  }
  async getLocalUserInfo(email: string) {
    return await this.userService.findByEmail(email);
  }
  async generateLocalToken(payload: UserPayload) {
    return await this.authService.generateJwtToken(payload);
  }
}
