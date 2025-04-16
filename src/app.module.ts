import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './admin/roles/roles.module';
import { AwsModule } from './aws/aws.module';
import { AdminModule } from './admin/admin.module';
import { CognitoModule } from './aws/cognito/cognito.module';
import { FileModule } from './file/file.module';
import { PrismaModule } from './prisma/prisma.module';
import { TerminalModule } from './terminal/terminal.module';
import { DynamodbModule } from './dynamodb/dynamodb.module';
import { GoogleGeminiModule } from './google-gemini/google-gemini.module';
import { Ec2Module } from './ec2/ec2.module';
import { AmazonQModule } from './amazon-q/amazon-q.module';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { DockerController } from './docker/docker.controller';
import { DockerModule } from './docker/docker.module';
import { DocumentationModule } from './documentation/documentation.module';
import { OrganizationModule } from './organization/organization.module';
import { ChatModule } from './chat/chat.module';
import { ApiKeyModule } from './apiKey/apiKey.module';
import { FolderModule } from './folder/folder.module';
import { ComponentModule } from './component/component.module';
import { MessageModule } from './message/message.module';
import { ApiUsageModule } from './apiUsage/apiUsage.module';
import { SessionModule } from './session/session.module';
import { VerificationTokenModule } from './verificationToken/verificationToken.module';
import { AccountModule } from './account/account.module';
import { DatabaseConnectionModule } from './databaseConnection/databaseConnection.module';
import { RdsModule } from './rds/rds.module';
import { SnippetModule } from './snippet/snippet.module';
import { PasswordModule } from './password/password.module';
import { EmailModule } from './email/email.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  controllers: [AppController, DockerController],
  providers: [AppService, GoogleStrategy],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UserModule,
    RolesModule,
    AwsModule,
    AdminModule,
    CognitoModule,
    FileModule,
    TerminalModule,
    PrismaModule,
    DynamodbModule,
    GoogleGeminiModule,
    Ec2Module,
    AmazonQModule,
    DockerModule,
    DocumentationModule,
    OrganizationModule,
    ChatModule,
    ApiKeyModule,
    FolderModule,
    ComponentModule,
    MessageModule,
    ApiUsageModule,
    SessionModule,
    VerificationTokenModule,
    AccountModule,
    DatabaseConnectionModule,
    RdsModule,
    SnippetModule,
    PasswordModule,
    EmailModule,
    UtilsModule,
  ],
})
export class AppModule {}
