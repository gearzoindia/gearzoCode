import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: string;
  jurisdictionId: string;
  tokenVersion: number;
  permissions?: string[];
  reAuthAt?: number;
}

export const CurrentAdmin = createParamDecorator(
  (data: keyof AuthenticatedAdmin | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.admin || request.user;
    if (!admin) return null;
    return data ? admin[data] : admin;
  },
);
