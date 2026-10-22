import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../../stores/cart-store';

export default function PaymentFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string; amountPaise?: string }>();
  const { getFinalTotalPaise } = useCartStore();

  const bookingId = params.bookingId || '';
  const amountPaise = params.amountPaise ? parseInt(params.amountPaise, 10) : getFinalTotalPaise();
  const displayAmount = Math.round(amountPaise / 100);

  // 10-minute countdown timer (09:42 min)
  const [secondsLeft, setSecondsLeft] = useState(582);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} min`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Large Red Circle with Glow */}
        <View style={styles.outerGlow}>
          <View style={styles.redCircle}>
            <Text style={styles.crossIcon}>✕</Text>
          </View>
        </View>

        {/* Title & Explanation */}
        <Text style={styles.title}>Payment failed</Text>
        <Text style={styles.subtitle}>
          Your bank declined the payment. No money was deducted.
        </Text>

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>₹{displayAmount}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.value}>{bookingId}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Slot held for</Text>
            <Text style={styles.timeValue}>{timeStr}</Text>
          </View>
        </View>

        <Text style={styles.slotNote}>
          Your slot is saved for 10 minutes. Try again to confirm it.
        </Text>

        <View style={{ flex: 1 }} />

        {/* CTAs */}
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => router.replace({ pathname: '/booking/payment', params: { bookingId, amountPaise: amountPaise.toString() } })}
          activeOpacity={0.9}
        >
          <Text style={styles.retryBtnText}>Retry Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeMethodBtn}
          onPress={() => router.replace({ pathname: '/booking/payment', params: { bookingId, amountPaise: amountPaise.toString() } })}
          activeOpacity={0.9}
        >
          <Text style={styles.changeMethodBtnText}>Change Payment Method</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportLink}
          onPress={() => router.push('/profile/help')}
        >
          <Text style={styles.supportText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  outerGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  redCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  timeValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  slotNote: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  retryBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  changeMethodBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 14,
  },
  changeMethodBtnText: {
    color: '#0F1F16',
    fontSize: 13,
    fontWeight: '700',
  },
  supportLink: {
    padding: 6,
  },
  supportText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
});
