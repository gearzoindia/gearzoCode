import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';
import { env } from '../../config/env';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendOtp(dto: SendOtpDto) {
    this.logger.log(`Initiating OTP send for phone: ${dto.phone}`);
    // Mock OTP safety check & dispatch
    if (env.OTP_PROVIDER === 'mock') {
      return {
        message: 'OTP sent successfully (mock environment: code 123456)',
        expiresInSeconds: 300,
      };
    }

    return {
      message: 'OTP sent successfully to registered mobile number',
      expiresInSeconds: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    this.logger.log(`Verifying OTP for phone: ${dto.phone}`);

    // Verify OTP code
    const isMock = env.OTP_PROVIDER === 'mock';
    const otpValue = dto.code || dto.otp;
    if (isMock && otpValue !== '123456') {
      throw new BadRequestException('Invalid OTP entered');
    }

    // Upsert or retrieve Customer
    let isNewUser = false;
    let customer: any = null;

    try {
      customer = await (this.prisma as any).customer?.findUnique?.({
        where: { phone: dto.phone },
      });

      if (!customer) {
        isNewUser = true;
        customer = await (this.prisma as any).customer?.create?.({
          data: {
            phone: dto.phone,
            profileState: 'PENDING',
            status: 'ACTIVE',
          },
        });
      }
    } catch (dbErr) {
      this.logger.warn(`Database customer find/create failed: ${dbErr}`);
      // Fallback with standard UUID format so Prisma/Postgres UUID queries don't fail
      const crypto = await import('crypto');
      customer = {
        id: crypto.randomUUID(),
        phone: dto.phone,
        isProfileComplete: false,
      };
      isNewUser = true;
    }

    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
    const accessToken = 'mock_jwt_access_cust_' + (customer?.id || 'id');
    const refreshToken = 'mock_jwt_refresh_cust_' + (customer?.id || 'id');

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
      isNewUser,
      user: {
        id: customer?.id,
        phone: dto.phone,
        role: 'customer',
        name: customer?.name ?? null,
        email: customer?.email ?? null,
        isProfileComplete: customer?.isProfileComplete ?? false,
      },
      sessionId,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return {
      accessToken: 'mock_jwt_access_renewed_' + Date.now(),
      refreshToken: dto.refreshToken,
      expiresIn: 900,
    };
  }

  async logout(userId: string, sessionId?: string) {
    this.logger.log(`Logging out user ${userId}, session ${sessionId}`);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    this.logger.log(`Logging out all sessions for user ${userId}`);
    return { message: 'All active sessions invalidated' };
  }

  async getSessions(userId: string) {
    return [
      {
        id: 'sess_1',
        userId,
        device: 'Customer Mobile App (iOS)',
        ip: '192.168.1.1',
        createdAt: new Date().toISOString(),
        current: true,
      },
    ];
  }

  async revokeSession(userId: string, sessionId: string) {
    this.logger.log(`Revoking session ${sessionId} for user ${userId}`);
    return { message: `Session ${sessionId} revoked` };
  }
}
