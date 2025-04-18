import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CognitoGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;

    const request = context.switchToHttp().getRequest();
    //console.log(request, 'CognitoGuard request');

    //const auth = await super.login(request, {}); // Ensures Passport sets request.user
    //console.log(auth, 'CognitoGuard');
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return request.user;
  }
}
