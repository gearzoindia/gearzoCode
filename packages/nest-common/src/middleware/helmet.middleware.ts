import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet, { HelmetOptions } from 'helmet';

export const defaultHelmetOptions: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
};

export function createHelmetMiddleware(options: HelmetOptions = defaultHelmetOptions) {
  return helmet(options);
}

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  private readonly handler = helmet(defaultHelmetOptions);

  use(req: Request, res: Response, next: NextFunction): void {
    this.handler(req, res, next);
  }
}
