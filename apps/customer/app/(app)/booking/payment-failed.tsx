import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@gearzo/ui';

export default function PaymentFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId: string; amountPaise: string }>();

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {/* Failed Icon */}
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 44 }}>❌</Text>
        </View>

        <Text style={styles.title}>Payment Unsuccessful</Text>
        <Text style={styles.desc}>
          Your payment could not be processed by your bank or UPI app. Don't worry, your preferred booking slot is temporarily on hold!
        </Text>

        {/* Hold Countdown Card */}
        <Card variant="elevated" style={styles.timerCard}>
          <Text style={styles.timerLabel}>Slot Hold Expires In</Text>
          <Text style={styles.timerCount}>{formattedTimer}</Text>
          <Text style={styles.timerSub}>Complete payment before the timer expires to secure your mechanic</Text>
        </Card>

        {/* Action Buttons */}
        <View style={{ width: '100%', gap: 12 }}>
          <Button
            title="Try Again / Change Payment Method"
            variant="primary"
            size="lg"
            onPress={() => router.back()}
          />
          <Button
            title="Cancel Booking & Return Home"
            variant="ghost"
            size="md"
            onPress={() => router.replace('/(app)/(tabs)')}
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  timerCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    marginBottom: 32,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  timerCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#B45309',
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  timerSub: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
  },
});
