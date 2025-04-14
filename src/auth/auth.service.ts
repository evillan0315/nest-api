import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoService } from '../aws/cognito/cognito.service';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import * as bcrypt from 'bcrypt';
import { CognitoPayload } from '../aws/cognito/cognito.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';
import { UserPayload } from './auth.interface';
import { AuthSignUpDto } from './auth.dto'; // Import the CognitoPayload interface

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cognitoService: CognitoService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}
  async getAccessToken(payload: any): Promise<any> {
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET || 'jwt_secret',
    });
    return access_token;
  }
  async generateJwtToken(payload: UserPayload): Promise<any> {
    if (!payload) {
      throw new Error('Missing payload.');
    }
    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      throw new Error('User does not exists in the database.');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    const access_token = await this.getAccessToken(payload);
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables.',
      );
    }
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    });
    const resultToken = {
      userId: user.id,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
    return resultToken;
    /*const account: UpdateAccountDto = {
      userId: user.id,
      provider: payload.provider,
      providerAccountId: payload.providerAccountId!,
      access_token,
      refresh_token,
    };
    return await this.userService.updateUserToken(user.id, account);*/
  }

  /*async validateUserToken(userId: string, refreshToken: string): Promise<any> {
    // compare with stored hashed refresh token
    return await this.userService.compareRefreshToken(userId, refreshToken);

  }*/
  async exchangeGoogleCodeForTokens(code: string): Promise<any> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('COGNITO_REDIRECT_URI');

    // Ensure required environment variables are available
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        'Missing required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI.',
      );
    }

    // Prepare the POST request to Google's OAuth2 token endpoint
    const url = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', `${redirectUri}/google`);

    try {
      const response = await axios.post(url, params);

      return response.data;
    } catch (error) {
      throw new Error(`Failed to exchange code for tokens: ${error.message}`);
    }
  }
  async loginWithGoogle(googleCode: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      const tokenResponse = await this.exchangeGoogleCodeForTokens(googleCode);
    } catch (error) {
      throw new Error(`Google OAuth login failed: ${error.message}`);
    }
  }
  async logOut(token: string): Promise<any> {
    try {
      const url = 'http://localhost:5000/api/auth/logout';
      const response = await axios.post(url, {token});
      return  response;
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
  //const hashedPassword = await bcrypt.hash(credentials.password, 10);

  async register(credentials: AuthSignUpDto) {
    try {
      console.log(credentials);

      // Hash the password

      // Prepare the user data with required fields
      const userData = {
        id: uuidv4(), // Generate a unique ID (ensure UUID is installed)
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(), // Set the current date for createdAt
        password: credentials.password,
        role: 'user',
      };

      // Create the user
      const user = await this.userService.create(userData);

      const token = this.jwtService.sign(
        { email: user.email },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' },
      );

      await this.emailService.sendConfirmationEmail(user.email, token);

      return {
        message: 'Registration successful. Please confirm your email.',
      };
      //return registeredUser;
    } catch (error) {
      throw new Error(`Google OAuth login failed: ${error.message}`);
    }
  }

  async login(email: string, password: string) {
    try {
      /*const payload = await this.cognitoService.authenticateUser(
        email,
        password,
      );*/
      const user = await this.userService.findByEmail(email);

      // TO DO add password bcrypt hashing - Need to add prisma model for password hashing
      if (!user) {
        throw new Error('Authentication failed : User does not exists!');
      }
      const localUserPayload: UserPayload = {
        userId: user.id,
        username: user.email,
        name: user.name,
        email: user.email,
        provider: 'local',
        role: user.role,
      };
      const accessToken = await this.getAccessToken(localUserPayload);
      const payload = { ...localUserPayload, accessToken };

      const tokenResult = await this.generateJwtToken(payload);
      console.log(tokenResult, 'tokenResult');
      return { ...payload, tokenResult };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}
