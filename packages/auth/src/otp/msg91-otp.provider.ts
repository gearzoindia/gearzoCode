import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OtpProvider } from './otp.provider';

@Injectable()
export class Msg91OtpProvider implements OtpProvider {
  private readonly logger = new Logger(Msg91OtpProvider.name);

  async send(phone: string, otp: string): Promise<void> {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      throw new Error('MSG91_AUTH_KEY or MSG91_TEMPLATE_ID environment variable is missing');
    }

    // E.164 phone: strip '+' for MSG91 mobile parameter if needed
    const mobile = phone.startsWith('+') ? phone.slice(1) : phone;

    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/otp',
        {
          template_id: templateId,
          mobile,
          otp,
        },
        {
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.type === 'error') {
        this.logger.error(`MSG91 API error: ${response.data.message}`);
        throw new Error(`MSG91 failed to dispatch OTP: ${response.data.message}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send OTP via MSG91 to ${phone.slice(0, 4)}***: ${error?.message}`);
      throw error;
    }
  }
}
