import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVehicles, useAuth, useBookingDetail } from '@gearzo/api-client';
import { useCartStore } from '../../../stores/cart-store';

export default function BookingConfirmedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string; amountPaise?: string; payAfter?: string }>();
  const { user } = useAuth();
  const { data: vehicles } = useVehicles();
  const { items, scheduledDate, scheduledSlot, getFinalTotalPaise } = useCartStore();

  const bookingId = params.bookingId || '';
  const { data: booking } = useBookingDetail(bookingId);

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const primaryVehicle = vehicleList.find((v) => v.isDefault) || vehicleList[0] || null;

  const displayBookingCode = (booking as any)?.code || booking?.id || bookingId || 'Order Placed';
  const displayAmount = booking?.totalAmountPaise
    ? Math.round(booking.totalAmountPaise / 100)
    : params.amountPaise
    ? Math.round(parseInt(params.amountPaise, 10) / 100)
    : Math.round(getFinalTotalPaise() / 100);

  const serviceName = booking?.serviceName || items[0]?.name || 'Vehicle Service';
  const vehicleText =
    booking?.vehicleSummary ||
    (primaryVehicle ? `${primaryVehicle.brand ? `${primaryVehicle.brand} ` : ''}${primaryVehicle.model}` : 'Vehicle');
  const slotText = booking?.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    : scheduledSlot
    ? `${scheduledDate || 'Today'} · ${scheduledSlot}`
    : 'Confirmed Slot';
  const addressText = booking?.address || user?.city || 'Doorstep Service Location';
  const isPayAfter = params.payAfter === 'true';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Large Green Checkmark with Mint Glow (Screen 15) */}
        <View style={styles.outerGlow}>
          <View style={styles.greenCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Booking confirmed!</Text>
        <Text style={styles.subtitle}>
          {isPayAfter ? 'Pay after service · ' : `Payment of ₹${displayAmount} received · `}Booking ID {displayBookingCode}
        </Text>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{serviceName}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>{vehicleText}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Slot</Text>
            <Text style={styles.value}>{slotText}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{addressText}</Text>
          </View>
        </View>

        <Text style={styles.findingNote}>
          We are now finding the best mechanic near you.
        </Text>

        <View style={{ flex: 1 }} />

        {/* Action Buttons */}
        {bookingId ? (
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() =>
              router.replace({
                pathname: `/booking/${bookingId}/searching` as any,
              })
            }
            activeOpacity={0.9}
          >
            <Text style={styles.trackBtnText}>Track Mechanic</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.viewBookingBtn}
          onPress={() => router.replace('/(app)/(tabs)/bookings')}
          activeOpacity={0.9}
        >
          <Text style={styles.viewBookingBtnText}>View Booking</Text>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  outerGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  greenCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkIcon: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '800',
    lineHeight: 46,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B4A27',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#F8FAF9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  findingNote: {
    marginTop: 20,
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
    textAlign: 'center',
  },
  trackBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  viewBookingBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  viewBookingBtnText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '700',
  },
});
