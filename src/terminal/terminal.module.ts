import { Module } from '@nestjs/common';
import { TerminalGateway } from './terminal.gateway';
import { DynamodbModule } from '../dynamodb/dynamodb.module';
import { CognitoModule } from '../aws/cognito/cognito.module';
import { AmazonQModule } from '../amazon-q/amazon-q.module';
import { TerminalController } from './terminal.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    UserModule,
    DynamodbModule,
    CognitoModule, // Import CognitoModule to make CognitoService available
    AmazonQModule, 
    AuthModule,
  ],
  providers: [TerminalGateway],
  controllers: [TerminalController],
})
export class TerminalModule {}
