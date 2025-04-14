import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport'; // For handling passport strategies
import { GoogleStrategy } from './strategies/google.strategy'; // Add Google strategy for OAuth
import { JwtModule } from '@nestjs/jwt'; // Add JWT for handling tokens (if using JWT)
import { GoogleAuthGuard } from './guards/google.guard'; // GoogleAuthGuard for route protection
import { GithubStrategy } from './strategies/github.strategy';
import { GithubAuthGuard } from './guards/github.guard';
import { CognitoModule } from '../aws/cognito/cognito.module'; // Import CognitoModule
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config globally available
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register passport with default JWT strategy
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key', // Get JWT secret from environment variable
      signOptions: {
        expiresIn: '1h', // Set token expiration
      },
    }),
    CognitoModule,
    UserModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GoogleAuthGuard,
    GithubStrategy,
    GithubAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
