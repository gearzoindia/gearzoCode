import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, OtpInput, Card } from '@gearzo/ui';
import { useAdminVerifyOtp } from '@gearzo/api-client';

export default function AdminOtpScreen() {
  const router = useRouter();
  const { challengeId, maskedPhone } = useLocalSearchParams<{ challengeId: string; maskedPhone?: string }>();
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyOtpMutation = useAdminVerifyOtp();

  const handleVerify = async () => {
    setErrorMsg(null);
    if (otp.length !== 6) return;

    try {
      const result = await verifyOtpMutation.mutateAsync({
        challengeId: challengeId || '',
        otp,
      });

      if (result.next === 'TOTP' || result.requiresTotp) {
        router.push({
          pathname: '/(auth)/totp',
          params: { challengeId: result.challengeId || challengeId, tempToken: result.tempToken },
        });
      } else {
        router.replace('/(app)/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error?.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>SMS Verification Code</Text>
          <Text style={styles.sub}>
            Enter the 6-digit one-time code sent to your registered security phone{' '}
            {maskedPhone ? `(${maskedPhone})` : ''}.
          </Text>

          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <OtpInput length={6} value={otp} onChange={setOtp} />
          </View>

          <Text style={styles.devHint}>
            ℹ️ Development Mode: Use Mock OTP <Text style={{ fontWeight: '800' }}>123456</Text>
          </Text>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <Button
            title={verifyOtpMutation.isPending ? 'Verifying...' : 'Verify & Enter Dashboard'}
            variant="primary"
            size="lg"
            disabled={otp.length !== 6 || verifyOtpMutation.isPending}
            onPress={handleVerify}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  sub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  devHint: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});
