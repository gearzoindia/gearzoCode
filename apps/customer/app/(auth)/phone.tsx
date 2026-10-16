import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@gearzo/ui';
import { useCustomerSendOtp } from '@gearzo/api-client';
import { phoneSchema } from '@gearzo/schemas';

export default function PhoneScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendOtpMutation = useCustomerSendOtp();

  const handleContinue = async () => {
    setErrorMessage(null);
    const cleanedDigits = phoneNumber.trim().replace(/\D/g, '');
    const fullPhone = `+91${cleanedDigits}`;

    const validation = phoneSchema.safeParse(fullPhone);
    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || 'Please enter a valid 10-digit Indian phone number');
      return;
    }

    try {
      await sendOtpMutation.mutateAsync({ phone: fullPhone });
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone },
      });
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error?.response?.status === 429) {
        setErrorMessage('Too many OTP attempts. Please wait a few minutes before trying again.');
      } else {
        setErrorMessage(error?.response?.data?.message || 'Failed to send OTP. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, justifyContent: 'center', marginBottom: 20 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={{ fontSize: 24, color: '#111827' }}>←</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
              Enter your mobile number
            </Text>
            <Text style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 22 }}>
              We'll send a 6-digit one-time password (OTP) to verify your account.
            </Text>

            <Input
              label="Mobile Number"
              isPhoneInput
              placeholder="98765 43210"
              value={phoneNumber}
              onChangeText={(val) => {
                setPhoneNumber(val);
                if (errorMessage) setErrorMessage(null);
              }}
              error={errorMessage || undefined}
              autoFocus
              accessibilityLabel="10-digit mobile number input"
            />
          </View>

          <View style={{ paddingTop: 20 }}>
            <Button
              title="Continue"
              variant="primary"
              size="lg"
              loading={sendOtpMutation.isPending}
              disabled={phoneNumber.replace(/\D/g, '').length !== 10 || sendOtpMutation.isPending}
              onPress={handleContinue}
              accessibilityLabel="Send OTP and continue"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
