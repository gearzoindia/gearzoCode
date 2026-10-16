import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MechanicStatus } from '@gearzo/db';

export interface AuthenticatedMechanic {
  id: string;
  phone: string;
  role: 'mechanic';
  status: MechanicStatus;
  sessionId?: string;
  name?: string;
  areaId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedMechanic | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedMechanic;
    return data ? user?.[data] : user;
  },
);
