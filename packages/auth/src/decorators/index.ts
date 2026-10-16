import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const REQUIRE_REAUTH_KEY = 'requireReAuth';
export const RequireReAuth = () => SetMetadata(REQUIRE_REAUTH_KEY, true);

export const MECHANIC_STATUS_KEY = 'requireMechanicStatus';
export const RequireMechanicStatus = (...statuses: string[]) => SetMetadata(MECHANIC_STATUS_KEY, statuses);

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
