import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CognitoGuard extends AuthGuard('cognito') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;

    const request = context.switchToHttp().getRequest();
    console.log(request.user, 'CognitoGuard request');
    //await super.logIn(request); // Ensures Passport sets request.user

    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return request.user;
  }
}
