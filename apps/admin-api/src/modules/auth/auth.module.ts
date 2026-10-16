import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService, SessionService, LimitsService } from '@gearzo/auth';
import { AdminAuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JurisdictionScopeGuard } from '../../common/guards/jurisdiction-scope.guard';
import { ReAuthGuard } from '../../common/guards/re-auth.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    SessionService,
    LimitsService,
    AdminAuthGuard,
    PermissionsGuard,
    JurisdictionScopeGuard,
    ReAuthGuard,
  ],
  exports: [
    AuthService,
    JwtService,
    SessionService,
    LimitsService,
    AdminAuthGuard,
    PermissionsGuard,
    JurisdictionScopeGuard,
    ReAuthGuard,
  ],
})
export class AuthModule {}
