import { Module } from '@nestjs/common';
import { AmazonQController } from './amazon-q.controller';
import { AmazonQService } from './amazon-q.service';
import { AmazonQGateway } from './amazon-q.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AmazonQController],
  providers: [AmazonQService, AmazonQGateway],
  exports: [AmazonQService],
})
export class AmazonQModule {}
