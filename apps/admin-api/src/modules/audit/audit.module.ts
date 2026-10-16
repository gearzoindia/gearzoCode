import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit.controller';
import { AuditLogsService } from './audit.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditModule {}
