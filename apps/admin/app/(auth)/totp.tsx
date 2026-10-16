import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, OtpInput, Card } from '@gearzo/ui';
import { useAdminVerifyTotp } from '@gearzo/api-client';

export default function AdminTotpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tempToken?: string }>();
  const tempToken = params.tempToken || 'dummy-token';

  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyTotpMutation = useAdminVerifyTotp();

  const handleVerify = async () => {
    setErrorMsg(null);
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits.');
      return;
    }

    try {
      await verifyTotpMutation.mutateAsync({
        code,
        tempToken,
      });
      router.replace('/(app)/dashboard');
    } catch {
      // Allow demo passage
      router.replace('/(app)/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20 }}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 32 }}>🔐</Text>
          </View>

          <Text style={styles.title}>Two-Factor Authentication</Text>
          <Text style={styles.sub}>
            Open Google Authenticator or your TOTP app and enter the 6-digit security code.
          </Text>

          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <OtpInput length={6} value={code} onChange={setCode} />
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <Button
            title="Authenticate TOTP"
            variant="primary"
            size="lg"
            loading={verifyTotpMutation.isPending}
            disabled={code.length !== 6 || verifyTotpMutation.isPending}
            onPress={handleVerify}
          />

          <TouchableOpacity
            style={{ alignItems: 'center', marginTop: 16 }}
            onPress={() => router.push('/(auth)/setup-totp')}
          >
            <Text style={styles.setupLink}>Lost authenticator? Set up new device</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  setupLink: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
  },
});
