import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { CreateCognitoUserDto } from '../../auth/dto/create-cognito-user.dto';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: (req: Request) => {
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
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // enables passing the request to validate()
    });
  }

  async validate(req: Request, payload: any): Promise<any> {
    const { email, name, role } = payload;

    try {
      if (!email) {
        throw new UnauthorizedException('No email found in token');
      }

      let user = await this.userService.findByEmail(email);

      if (!user) {
        const createUser: CreateCognitoUserDto = {
          email,
          name,
          role,
          image: payload?.image,
          provider: 'cognito',
          providerAccountId: payload?.userId,
          //access_token: access_token,
          //refresh_token: refresh_token,
        };

        const userCreated =
          await this.userService.createCognitoUser(createUser);

        if (!userCreated) {
          throw new UnauthorizedException('User not created');
        }

        user = userCreated;
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }

  // 💥 Catch token expiration errors here
  authenticate(req: Request, options?: any) {
    try {
      super.authenticate(req, options);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired. Please log in again.');
      }
      throw err;
    }
  }
}
