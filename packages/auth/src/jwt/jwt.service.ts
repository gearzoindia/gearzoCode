import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  aud: string;
  role?: string;
  tokenVersion: number;
  jurisdictionId?: string;
  iat?: number;
  exp?: number;
}

export interface SignJwtInput {
  sub: string;
  aud: string;
  role?: string;
  tokenVersion: number;
  jurisdictionId?: string;
  expiresInSec?: number;
}

@Injectable()
export class JwtService {
  private get secret(): string {
    const s = process.env.JWT_ACCESS_SECRET;
    if (!s) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_ACCESS_SECRET environment variable is missing');
      }
      return 'dev-jwt-access-secret-minimum-32-characters-required!';
    }
    return s;
  }

  signAccessToken(payload: SignJwtInput): string {
    const { expiresInSec = 900, ...claims } = payload;
    return jwt.sign(claims, this.secret, {
      expiresIn: expiresInSec,
      audience: claims.aud,
    });
  }

  async verifyAccessToken(token: string, expectedAudience: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.secret, {
        audience: expectedAudience,
      }) as JwtPayload;

      if (!decoded.sub || !decoded.aud) {
        throw new UnauthorizedException('Malformed token payload');
      }

      return decoded;
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid token: ${err.message}`);
      }
      throw new UnauthorizedException(err.message || 'Token verification failed');
    }
  }
}
