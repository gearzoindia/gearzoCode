import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    // Extract customer ID from mock token format: mock_jwt_access_cust_{customerId}
    // In production, @gearzo/auth JwtService would verify the JWT signature and decode payload
    try {
      let customerId = 'cust_default_id';

      // Mock tokens from auth.service.ts have format: mock_jwt_access_cust_{uuid}
      const mockPrefix = 'mock_jwt_access_cust_';
      if (token.startsWith(mockPrefix)) {
        customerId = token.substring(mockPrefix.length);
      }

      request.user = {
        id: customerId,
        role: 'customer',
        sessionId: 'sess_' + customerId.substring(0, 8),
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
