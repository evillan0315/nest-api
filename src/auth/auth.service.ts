import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoService } from '../aws/cognito/cognito.service';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { addHours, addDays } from 'date-fns';
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import * as bcrypt from 'bcrypt';
import { CognitoPayload } from '../aws/cognito/cognito.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { SessionService } from '../session/session.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';
import { UserPayload } from './auth.interface';
import { AuthSignUpDto } from './auth.dto'; // Import the CognitoPayload interface
import { formatUnixTimestamp } from '../utils/date';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cognitoService: CognitoService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
  ) {}
  async getAccessToken(payload: any): Promise<any> {
    const expiresIn = '1h';
    const expiresAt = addHours(new Date(), 1);
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn,
      secret: process.env.JWT_SECRET || 'jwt_secret',
    });
    const data = {
      id: uuidv4(),
      sessionToken: accessToken,
      userId: payload.sub,
      expires: expiresAt,
    };
    await this.sessionService.create(data);
    return accessToken;
  }

  async generateJwtToken(payload: UserPayload): Promise<any> {
    const expiresIn = '1d';
    const expiresAt = addHours(new Date(), 1);
    if (!payload) {
      throw new Error('Missing payload.');
    }
    const user = await this.userService.findByEmail(payload.email);
    console.log(user, 'user');
    if (!user) {
      throw new Error('User does not exists in the database.');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    const newPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      provider: payload.provider,
      providerAccountId: payload.client_id
        ? payload.client_id
        : process.env.JWT_REFRESH_SECRET,
    };
    const accessToken = await this.getAccessToken(newPayload);
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables.',
      );
    }
    const refreshToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    });
    console.log(refreshToken, 'refreshToken');
    /*const resultToken = {
      userId: user.id,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
    return resultToken;*/
    const account: UpdateAccountDto = {
      userId: user.id,
      provider: payload.provider,
      providerAccountId: newPayload.providerAccountId,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    //await this.userService.updateUserToken(user.id, account);
    return { ...newPayload, accessToken, refreshToken };
  }

  async verifyAccessToken(accessToken: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_SECRET || 'default_secret',
      });

      return {
        sub: decoded.sub,
        role: decoded.role,
        provider: decoded.provider,
        email: decoded.email,
      };
    } catch (err) {
      console.error('Invalid or expired token:', err.message);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
  async verifyRefreshToken(refreshToken: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });
      console.log(decoded, 'verifyRefreshToken refreshToken');
      return {
        sub: decoded.sub,
        role: decoded.role,
        provider: decoded.provider,
        email: decoded.email,
      };
    } catch (err) {
      console.error('Invalid or expired token:', err.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<any> {
    try {
      const userAccount = await this.userService.findUserAccountById(userId);
      console.log(userAccount, 'validateRefreshToken userAccount');
      if (!userAccount) {
        throw new Error('Refresh Token does not belong to any user.');
      }

      // compare with stored hashed refresh token
      const isValid = await bcrypt.compare(
        refreshToken,
        userAccount.refresh_token,
      );
      if (!isValid) {
        throw new Error('Refresh Token does not match with the stored token.');
      }
      console.log(refreshToken, isValid);
      return isValid;
    } catch (err) {
      throw new Error('Refresh Token is not valid', err.message);
    }
  }
  async validateAccessToken(userId: string, accessToken: string): Promise<any> {
    try {
      const userAccount = await this.userService.findUserAccountById(userId);

      if (!userAccount) {
        throw new Error('Access Token does not belong to any user.');
      }
      // compare with stored hashed refresh token
      const isValid = await bcrypt.compare(
        accessToken,
        userAccount.access_token,
      );
      if (!isValid) {
        throw new Error('Access Token does not match with the stored token.');
      }
      return isValid;
    } catch (err) {
      throw new Error('Access Token is not valid', err.message);
    }
  }
  async logout(token: string): Promise<any> {
    try {
      const url = 'http://localhost:5000/api/auth/logout';
      const response = await axios.post(url, { token });
      return response;
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
      const user = await this.userService.getUserWithPassword(email);
      const currentPass = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, user?.password?.hash);
      if (!isValid)
        throw new Error('Authentication failed : Password incorrect!');
      // TO DO add password bcrypt hashing - Need to add prisma model for password hashing
      if (!user) {
        throw new Error('Authentication failed : User does not exists!');
      }
      const localUserPayload: UserPayload = {
        sub: user.id,
        email: user.email,
        provider: 'local',
        role: user.role,
      };
      //const accessToken = await this.getAccessToken(localUserPayload);
      //const payload = { ...localUserPayload, accessToken };

      const tokenResult = await this.generateJwtToken(localUserPayload);
      return tokenResult;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}
