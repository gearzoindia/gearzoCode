import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, OtpInput, Card } from '@gearzo/ui';

export default function AdminOtpScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    router.replace('/(app)/dashboard');
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
            Enter the 6-digit one-time code sent to your registered security phone.
          </Text>

          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <OtpInput length={6} value={otp} onChange={setOtp} />
          </View>

          <Button
            title="Verify & Enter Dashboard"
            variant="primary"
            size="lg"
            disabled={otp.length !== 6}
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
});
