import { Injectable, Logger } from '@nestjs/common';
import { OtpProvider } from './otp.provider';

@Injectable()
export class MockOtpProvider implements OtpProvider {
  private readonly logger = new Logger(MockOtpProvider.name);

  async send(phone: string, _otp: string): Promise<void> {
    this.logger.warn(
      `MockOtpProvider: SMS delivery simulated for ${phone.slice(0, 4)}***${phone.slice(-2)} (OTP not sent to real provider)`,
    );
  }

  getCode(): string {
    return process.env.MOCK_OTP_CODE || '123456';
  }
}
