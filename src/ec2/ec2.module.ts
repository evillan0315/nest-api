import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Ec2Controller } from './ec2.controller';
import { Ec2Service } from './ec2.service';

/**
 * Module for EC2 instance management
 */
@Module({
  imports: [ConfigModule],
  controllers: [Ec2Controller],
  providers: [Ec2Service],
  exports: [Ec2Service],
})
export class Ec2Module {}
