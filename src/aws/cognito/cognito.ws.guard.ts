import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { CognitoService } from './cognito.service';
import { UserService } from '../../user/user.service';
import { AuthService } from '../../auth/auth.service';
import * as cookie from 'cookie';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class CognitoWsGuard implements CanActivate {
  private jwksClient: jwksClient.JwksClient;

  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userService: UserService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {
    this.jwksClient = jwksClient({
      jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const cookies = client.handshake?.headers?.cookie;

    if (!cookies) {
      throw new UnauthorizedException('Missing cookies');
    }

    const parsedCookies = cookie.parse(cookies);
    let token = parsedCookies['access_token'];

    if (!token) {
      token =
        client.handshake?.auth?.token ||
        client.handshake?.headers?.authorization?.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedException('Missing Cognito token');
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new UnauthorizedException('JWT_SECRET not found');
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // throws if expired or invalid

      if (!decodedToken) {
        throw new UnauthorizedException(
          'Token does not exists. Please log in again.',
        );
      }
      const user = await this.userService.findByEmail(
        (decodedToken as jwt.JwtPayload).email,
      );
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      client.data.user = user; // Attach user to socket

      return true;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        client.emit('token_expired', {
          message: 'Access token has expired. Please refresh.',
        });
        client.disconnect();
        return false;
      }

      console.error('[CognitoWsGuard] Token error:', err);
      throw new UnauthorizedException('Invalid Cognito token');
    }
  }
}
