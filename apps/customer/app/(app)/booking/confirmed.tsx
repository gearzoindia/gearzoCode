import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@gearzo/ui';

export default function BookingConfirmedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId: string; amountPaise: string }>();

  const bookingId = params.bookingId || `GZ-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {/* Success Animation Circle */}
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 44 }}>🎉</Text>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.desc}>
          Your service request has been confirmed. A certified GearZo mechanic is being dispatched to your doorstep.
        </Text>

        {/* Confirmation Details Card */}
        <Card variant="elevated" style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.valueBold}>#{bookingId.slice(0, 10).toUpperCase()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Scheduled Slot</Text>
            <Text style={styles.value}>Today, Instant (Within 45 mins)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={[styles.value, { color: '#1B5E20', fontWeight: '700' }]}>PAID / CONFIRMED</Text>
          </View>
        </Card>

        {/* CTAs */}
        <View style={{ width: '100%', gap: 12 }}>
          <Button
            title="Track Mechanic Live 📍"
            variant="primary"
            size="lg"
            onPress={() =>
              router.replace({
                pathname: `/booking/${bookingId}/searching`,
              })
            }
          />
          <Button
            title="View All Bookings"
            variant="outline"
            size="md"
            onPress={() => router.replace('/(app)/(tabs)/bookings')}
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
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
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  detailsCard: {
    width: '100%',
    padding: 18,
    borderRadius: 14,
    marginBottom: 32,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  valueBold: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
});
