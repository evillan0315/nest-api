import { Module } from '@nestjs/common';
import { FormSubmissionService } from './form-submission.service';
import { FormSubmissionController } from './form-submission.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormSubmissionController],
  providers: [FormSubmissionService]
})
export class FormSubmissionModule {}

