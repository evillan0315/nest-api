import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';

import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        //console.log(req.cookies, 'req CognitoStrategy jwtFromRequest');
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.split(' ')[1];
        }

        if (req && req.cookies) {
          return req.cookies['access_token'];
        }

        console.warn('No JWT Found in Headers or Cookies');
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      provider: payload.provider,
      providerAccountId: payload.providerAccountId,
    };
  }
}
