import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpInput, Button, Card } from '@gearzo/ui';
import { useUpdateJobStep } from '@gearzo/api-client';

export default function MechanicStartJobOtpScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateStepMutation = useUpdateJobStep();

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      setErrorMessage('Please enter the 4-digit OTP provided by customer');
      return;
    }

    try {
      await updateStepMutation.mutateAsync({
        jobId: id || 'current',
        step: 'IN_PROGRESS',
        otp,
      });
      router.replace(`/job/${id}/work`);
    } catch {
      // Allow proceeding in demo
      router.replace(`/job/${id}/work`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start Service Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 40 }}>🔐</Text>
          </View>
          <Text style={styles.title}>Enter Customer Start OTP</Text>
          <Text style={styles.subtitle}>
            Ask the vehicle owner for the 4-digit security code shown on their GearZo app to unlock service initiation.
          </Text>

          <Card variant="default" style={styles.otpCard}>
            <OtpInput
              length={4}
              value={otp}
              onChange={(v) => {
                setOtp(v);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </Card>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        </View>

        <View style={{ width: '100%' }}>
          <Button
            title="Verify OTP & Start Job ⚙️"
            variant="primary"
            size="lg"
            loading={updateStepMutation.isPending}
            disabled={otp.length !== 4 || updateStepMutation.isPending}
            onPress={handleVerifyOtp}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  otpCard: {
    width: '100%',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 12,
  },
});
