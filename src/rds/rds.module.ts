import { Module } from '@nestjs/common';
import { RdsInstanceService } from './rds-instance.service';
import { RdsInstanceController } from './rds-instance.controller';
import { RdsParameterService } from './rds-parameter.service';
import { RdsBackupService } from './rds-backup.service';

@Module({
  imports: [],
  controllers: [RdsInstanceController],
  providers: [RdsInstanceService, RdsParameterService, RdsBackupService],
})
export class RdsModule {}
