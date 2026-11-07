import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { GearzoSplashLogin } from '@gearzo/ui';
import { useCustomerSendOtp } from '@gearzo/api-client';
import { phoneSchema } from '@gearzo/schemas';

export default function CustomerWelcomeScreen() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sendOtpMutation = useCustomerSendOtp();

  const handleContinue = async (rawDigits: string) => {
    setErrorMessage(null);
    const cleanedDigits = rawDigits.trim().replace(/\D/g, '');
    const fullPhone = `+91${cleanedDigits}`;

    const validation = phoneSchema.safeParse(fullPhone);
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please enter a valid 10-digit Indian phone number';
      setErrorMessage(msg);
      throw new Error(msg);
    }

    try {
      await sendOtpMutation.mutateAsync({ phone: fullPhone });
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone },
      });
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      let msg = 'Failed to send OTP. Please try again.';
      if (error?.response?.status === 429) {
        msg = 'Too many OTP attempts. Please wait a few minutes before trying again.';
      } else if (error?.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMessage(msg);
      throw err;
    }
  };

  return (
    <GearzoSplashLogin
      appType="customer"
      title="Welcome to Gearzo"
      subtitle="Your journey deserves a reliable mechanic."
      tagline="Mechanic, Minutes Away."
      onContinue={handleContinue}
      isLoading={sendOtpMutation.isPending}
      errorMessage={errorMessage}
      onTermsPress={() => router.push('/(app)/profile/legal')}
      onPrivacyPress={() => router.push('/(app)/profile/legal')}
    />
  );
}
