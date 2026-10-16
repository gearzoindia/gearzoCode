import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Permissions('AUDIT_VIEW')
  @ApiOperation({ summary: 'Query immutable append-only administrative audit logs' })
  async findAll(@Query() dto: QueryAuditLogsDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.auditLogsService.findAll(dto, scope);
  }
}
