import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, OtpInput, Card } from '@gearzo/ui';

export default function SetupTotpScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const secretKey = 'JBSWY3DPEHPK3PXP';

  const handleVerifySetup = () => {
    Alert.alert('2FA Enabled', 'Two-factor authenticator setup is complete.');
    router.replace('/(app)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Setup Two-Factor Authenticator</Text>
          <Text style={styles.sub}>
            Scan this QR code with Google Authenticator, 1Password, or Authy to enroll your device.
          </Text>

          {/* QR Code Canvas Simulator */}
          <View style={styles.qrBox}>
            <Text style={{ fontSize: 48 }}>▦</Text>
            <Text style={styles.qrLabel}>GEARZO-ADMIN-2FA-QR</Text>
          </View>

          <View style={styles.secretBox}>
            <Text style={styles.secretLabel}>Manual Entry Secret Key:</Text>
            <Text style={styles.secretCode}>{secretKey}</Text>
          </View>

          <Text style={styles.verifyPrompt}>Enter 6-digit code from authenticator to confirm:</Text>
          <View style={{ marginVertical: 14, alignItems: 'center' }}>
            <OtpInput length={6} value={code} onChange={setCode} />
          </View>

          <Button
            title="Confirm & Finish Setup"
            variant="primary"
            size="lg"
            disabled={code.length !== 6}
            onPress={handleVerifySetup}
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
    alignItems: 'center',
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
    marginBottom: 16,
  },
  qrBox: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  secretBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  secretLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  secretCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
    marginTop: 2,
  },
  verifyPrompt: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
});
