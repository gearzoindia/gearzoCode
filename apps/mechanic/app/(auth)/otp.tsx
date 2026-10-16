import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpInput, Button } from '@gearzo/ui';
import { useMechanicVerifyOtp, useMechanicSendOtp } from '@gearzo/api-client';

export default function MechanicOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '';

  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyOtpMutation = useMechanicVerifyOtp();
  const sendOtpMutation = useMechanicSendOtp();

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) return;
    setErrorMessage(null);

    try {
      const response = await verifyOtpMutation.mutateAsync({
        phone,
        otp: codeToVerify,
      });

      // Navigate to onboarding wizard or main tabs
      if (response.isNewUser || !response.user.name) {
        router.replace('/(onboarding)/type');
      } else {
        router.replace('/(app)/(tabs)');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error?.response?.data?.message || 'Invalid OTP code. Please try again.');
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      void handleVerify(otp);
    }
  }, [otp]);

  const handleResend = async () => {
    try {
      await sendOtpMutation.mutateAsync({ phone });
      setErrorMessage(null);
      Alert.alert('OTP Sent', 'A fresh 6-digit OTP code has been sent to your phone.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error?.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'space-between' }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
                <Text style={{ fontSize: 24, color: '#111827' }}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ fontSize: 14, color: '#1B5E20', fontWeight: '600' }}>Edit Number</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
              Partner Verification
            </Text>
            <Text style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 22 }}>
              Enter the 6-digit verification code sent to{' '}
              <Text style={{ fontWeight: '700', color: '#111827' }}>{phone}</Text>
            </Text>

            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (errorMessage) setErrorMessage(null);
              }}
              onResend={handleResend}
              resendCountdownSeconds={30}
            />

            {errorMessage && (
              <Text style={{ fontSize: 13, color: '#DC2626', textAlign: 'center', marginTop: 12 }}>
                {errorMessage}
              </Text>
            )}
          </View>

          <View style={{ paddingTop: 20 }}>
            <Button
              title="Verify & Proceed"
              variant="primary"
              size="lg"
              loading={verifyOtpMutation.isPending}
              disabled={otp.length !== 6 || verifyOtpMutation.isPending}
              onPress={() => handleVerify(otp)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
