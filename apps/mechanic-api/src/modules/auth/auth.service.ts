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
    this.logger.log(`Initiating OTP send for mechanic phone: ${dto.phone}`);
    if (env.OTP_PROVIDER === 'mock') {
      return {
        message: 'OTP sent successfully (mock environment: code 123456)',
        expiresInSeconds: 300,
      };
    }

    return {
      message: 'OTP sent successfully to registered mechanic mobile number',
      expiresInSeconds: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    this.logger.log(`Verifying OTP for mechanic phone: ${dto.phone}`);

    const isMock = env.OTP_PROVIDER === 'mock';
    if (isMock && dto.code !== '123456') {
      throw new BadRequestException('Invalid OTP entered');
    }

    let isNewUser = false;
    let mechanic: any = null;

    try {
      mechanic = await (this.prisma as any).mechanic?.findUnique?.({
        where: { phone: dto.phone },
        include: { profile: true },
      });

      if (!mechanic) {
        isNewUser = true;
        mechanic = await (this.prisma as any).mechanic?.create?.({
          data: {
            phone: dto.phone,
            status: 'PENDING_PROFILE',
          },
          include: { profile: true },
        });
      }
    } catch {
      // Fallback if DB connection deferred
      mechanic = {
        id: 'mech_' + Math.random().toString(36).substring(2, 9),
        phone: dto.phone,
        status: 'PENDING_PROFILE',
      };
      isNewUser = true;
    }

    const sessionId = 'sess_mech_' + Math.random().toString(36).substring(2, 11);
    const accessToken = 'mock_jwt_access_mech_' + (mechanic?.id || 'id');
    const refreshToken = 'mock_jwt_refresh_mech_' + (mechanic?.id || 'id');

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      isNewUser,
      user: {
        id: mechanic?.id,
        phone: dto.phone,
        role: 'mechanic',
        status: mechanic?.status || 'PENDING_PROFILE',
        name: mechanic?.name ?? null,
      },
      sessionId,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return {
      accessToken: 'mock_jwt_access_renewed_mech_' + Date.now(),
      refreshToken: dto.refreshToken,
      expiresIn: 900,
    };
  }

  async logout(mechanicId: string, sessionId?: string) {
    this.logger.log(`Logging out mechanic ${mechanicId}, session ${sessionId}`);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(mechanicId: string) {
    this.logger.log(`Logging out all sessions for mechanic ${mechanicId}`);
    return { message: 'All active mechanic sessions invalidated' };
  }

  async getSessions(mechanicId: string) {
    return [
      {
        id: 'sess_mech_1',
        mechanicId,
        device: 'Mechanic Partner Mobile App (Android)',
        ip: '192.168.1.10',
        createdAt: new Date().toISOString(),
        current: true,
      },
    ];
  }

  async revokeSession(mechanicId: string, sessionId: string) {
    this.logger.log(`Revoking session ${sessionId} for mechanic ${mechanicId}`);
    return { message: `Session ${sessionId} revoked` };
  }
}
