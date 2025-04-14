// auth/guards/refresh-token.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    try {
      //const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
      //req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
