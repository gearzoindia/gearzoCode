import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVehicles, useAuth, useBookingDetail } from '@gearzo/api-client';

export default function SearchingMechanicScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: vehicles } = useVehicles();
  const { data: booking } = useBookingDetail(id || '');

  const bookingId = (booking as any)?.code || booking?.id || id || '';
  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const primaryVehicle = vehicleList.find((v) => v.isDefault) || vehicleList[0] || null;

  const vehicleSummary =
    booking?.vehicleSummary ||
    (primaryVehicle ? `${primaryVehicle.brand ? `${primaryVehicle.brand} ` : ''}${primaryVehicle.model}` : 'Your Vehicle');

  const slotSummary = booking?.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    : 'Immediate Dispatch';

  const addressSummary = booking?.address || user?.city || 'Selected Location';

  const [progress] = useState(new Animated.Value(0.15));

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progress, {
      toValue: 0.95,
      duration: 3500,
      useNativeDriver: false,
    }).start();

    // Transition to Screen 17 (Mechanic Assigned) after 3.8 seconds
    const timer = setTimeout(() => {
      if (id) {
        router.replace(`/booking/${id}/track`);
      }
    }, 3800);

    return () => clearTimeout(timer);
  }, [id]);

  const handleCancelBooking = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel finding a mechanic?', [
      { text: 'Wait', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: () => router.replace('/(app)/(tabs)/bookings'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)/bookings')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bookingId ? `Booking ID ${bookingId}` : 'Searching Mechanic'}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Map Radar Grid Background */}
      <View style={styles.mapArea}>
        {/* Radar Rings */}
        <View style={[styles.radarCircle, { width: 320, height: 320, borderRadius: 160 }]} />
        <View style={[styles.radarCircle, { width: 220, height: 220, borderRadius: 110 }]} />
        <View style={[styles.radarCircle, { width: 130, height: 130, borderRadius: 65 }]} />

        {/* Center Pin */}
        <View style={styles.pinCircle}>
          <Text style={{ fontSize: 20 }}>📍</Text>
        </View>

        {/* Floating Card at Bottom */}
        <View style={styles.floatingCard}>
          <Text style={styles.findingTitle}>Finding the best mechanic near you...</Text>
          <Text style={styles.findingSub}>This usually takes under 2 minutes</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Booking Summary Pill */}
          <View style={styles.summaryPill}>
            <View style={styles.summaryIconBox}>
              <Text style={{ fontSize: 16 }}>🔧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>
                {booking?.serviceName || 'Vehicle Service'} · {vehicleSummary}
              </Text>
              <Text style={styles.summarySub}>
                {slotSummary} · {addressSummary}
              </Text>
            </View>
          </View>

          {/* Cancel Action */}
          <TouchableOpacity onPress={handleCancelBooking} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel booking</Text>
          </TouchableOpacity>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    backgroundColor: 'transparent',
  },
  pinCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 5,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    zIndex: 10,
  },
  findingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  findingSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summarySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
