export interface OtpProvider {
  send(phone: string, otp: string): Promise<void>;
}

export const OTP_PROVIDER = Symbol('OTP_PROVIDER');
