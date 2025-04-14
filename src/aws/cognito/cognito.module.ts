import { Module } from '@nestjs/common';
import { CognitoService } from './cognito.service';
import { CognitoController } from './cognito.controller';
import { CognitoStrategy } from './cognito.strategy';
import { CognitoGuard } from './cognito.guard'; // Import the Cognito Guard
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [UserModule],
  providers: [
    CognitoService, // Provide Cognito service to handle AWS Cognito interactions
    CognitoStrategy, // Provide the custom strategy to validate JWT tokens
    CognitoGuard, // Provide the custom guard for protecting routes
  ],
  controllers: [CognitoController],
  exports: [CognitoService, CognitoGuard], // Export the service and guard for use in other modules
})
export class CognitoModule {}
