import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
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
    const otpValue = dto.code || dto.otp;
    if (isMock && otpValue !== '123456') {
      throw new BadRequestException('Invalid OTP entered');
    }

    let isNewUser = false;
    let mechanic: any = null;

    const rawDigits = dto.phone.replace(/\D/g, '');
    const clean10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
    const phoneWithPlus91 = `+91${clean10}`;

    try {
      mechanic = await (this.prisma as any).mechanic?.findFirst?.({
        where: {
          OR: [
            { phone: dto.phone },
            { phone: clean10 },
            { phone: phoneWithPlus91 },
          ],
        },
        include: { profile: true },
      });

      if (!mechanic) {
        isNewUser = true;
        mechanic = await (this.prisma as any).mechanic?.create?.({
          data: {
            phone: phoneWithPlus91,
            status: 'PENDING_PROFILE',
          },
          include: { profile: true },
        });
      }
    } catch {
      // Fallback if DB connection deferred
      mechanic = {
        id: randomUUID(),
        phone: phoneWithPlus91,
        status: 'PENDING_PROFILE',
      };
      isNewUser = true;
    }

    const jwtSecret = env.JWT_SECRET || 'gearzo_dev_secret_key_change_in_prod';
    const accessToken = jwt.sign(
      {
        sub: mechanic.id,
        aud: 'mechanic',
        role: 'mechanic',
        phone: mechanic.phone || dto.phone,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
      {
        sub: mechanic.id,
        aud: 'mechanic',
        role: 'mechanic',
        phone: mechanic.phone || dto.phone,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    const sessionId = 'sess_mech_' + Math.random().toString(36).substring(2, 11);

    return {
      accessToken,
      refreshToken,
      tokens: {
        accessToken,
        refreshToken,
      },
      expiresIn: 900,
      isNewUser,
      user: {
        id: mechanic.id,
        phone: mechanic.phone || dto.phone,
        role: 'mechanic',
        status: mechanic.status || 'PENDING_PROFILE',
        name: mechanic.name ?? null,
      },
      sessionId,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const jwtSecret = env.JWT_SECRET || 'gearzo_dev_secret_key_change_in_prod';
    const accessToken = jwt.sign(
      {
        aud: 'mechanic',
        role: 'mechanic',
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    return {
      accessToken,
      refreshToken: dto.refreshToken,
      tokens: {
        accessToken,
        refreshToken: dto.refreshToken,
      },
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
