import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Avatar, Badge } from '@gearzo/ui';

export default function TrackMechanicScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock booking track data with realistic details
  const [mechanicStatus, setMechanicStatus] = useState<'ON_THE_WAY' | 'ARRIVED'>('ON_THE_WAY');

  const mechanic = {
    name: 'Ramesh Kumar',
    rating: 4.89,
    jobsCompleted: 342,
    phone: '+919876543210',
    vehicle: 'Honda Activa (KA 05 HY 8821)',
  };

  const startOtp = '4829'; // 4-digit service start verification OTP

  const handleCall = () => {
    Linking.openURL(`tel:${mechanic.phone}`);
  };

  const handleSimulateArrived = () => {
    setMechanicStatus('ARRIVED');
    Alert.alert('Mechanic Arrived', 'Ramesh Kumar has reached your doorstep! Share the OTP with him.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)/bookings')} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Mechanic Tracking</Text>
        <TouchableOpacity onPress={() => router.push('/profile/help')} style={styles.backBtn}>
          <Text style={{ fontSize: 18 }}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Map Simulation Box */}
        <View style={styles.mapBox}>
          <View style={styles.mapPinCustomer}>
            <Text style={{ fontSize: 20 }}>🏠</Text>
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText}>Your Location</Text>
            </View>
          </View>

          <View style={styles.mapPinMechanic}>
            <Text style={{ fontSize: 20 }}>🛵</Text>
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText}>Ramesh (1.2 km away)</Text>
            </View>
          </View>

          <View style={styles.mapWatermark}>
            <Text style={styles.mapWatermarkText}>Live GPS PostGIS Map Simulation</Text>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          {/* ETA / Status Banner */}
          <Card variant="elevated" style={styles.etaCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.etaStatus}>
                  {mechanicStatus === 'ON_THE_WAY' ? 'Mechanic is on the way' : 'Mechanic has arrived at doorstep!'}
                </Text>
                <Text style={styles.etaTime}>
                  {mechanicStatus === 'ON_THE_WAY' ? 'Arriving in ~12 mins' : 'Ready to start service'}
                </Text>
              </View>
              <Badge
                label={mechanicStatus === 'ON_THE_WAY' ? 'EN ROUTE' : 'AT DOORSTEP'}
                variant={mechanicStatus === 'ON_THE_WAY' ? 'info' : 'success'}
              />
            </View>
          </Card>

          {/* START OTP CARD */}
          <Card variant="default" style={styles.otpCard}>
            <Text style={styles.otpTitle}>Service Start OTP</Text>
            <Text style={styles.otpSub}>
              Share this 4-digit security code with the technician to authorize work.
            </Text>
            <View style={styles.otpDigitsContainer}>
              {startOtp.split('').map((digit, idx) => (
                <View key={idx} style={styles.otpBox}>
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Mechanic Card */}
          <Card variant="default" style={styles.mechanicCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar name={mechanic.name} size="lg" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.mechanicName}>{mechanic.name}</Text>
                  <Text style={{ fontSize: 12, color: '#F59E0B' }}>★ {mechanic.rating}</Text>
                </View>
                <Text style={styles.mechanicSub}>
                  Certified GearZo Pro • {mechanic.jobsCompleted} jobs
                </Text>
                <Text style={styles.mechanicVehicle}>{mechanic.vehicle}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCall}
                accessibilityRole="button"
                accessibilityLabel="Call mechanic"
              >
                <Text style={{ fontSize: 20 }}>📞</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Timeline */}
          <Text style={styles.sectionHeader}>Order Milestones</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotDone]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineTitle}>Booking Confirmed</Text>
                <Text style={styles.timelineDesc}>Order assigned to certified mechanic</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotDone]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineTitle}>On The Way</Text>
                <Text style={styles.timelineDesc}>Technician carrying OEM spares & toolkits</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, mechanicStatus === 'ARRIVED' && styles.timelineDotDone]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineTitle}>Doorstep Arrival</Text>
                <Text style={styles.timelineDesc}>Verify OTP and initiate vehicle check</Text>
              </View>
            </View>
          </View>

          {/* Dev Simulation Button */}
          <View style={{ marginTop: 20, gap: 10 }}>
            {mechanicStatus === 'ON_THE_WAY' && (
              <Button
                title="Simulate Mechanic Arrived"
                variant="outline"
                size="md"
                onPress={handleSimulateArrived}
              />
            )}
            <Button
              title="Go to Service Progress →"
              variant="primary"
              size="md"
              onPress={() => router.push(`/booking/${id}/progress`)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  mapBox: {
    height: 220,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapPinCustomer: {
    position: 'absolute',
    top: 50,
    right: 70,
    alignItems: 'center',
  },
  mapPinMechanic: {
    position: 'absolute',
    bottom: 50,
    left: 70,
    alignItems: 'center',
  },
  pinLabel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 3,
    marginTop: 2,
  },
  pinLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  mapWatermark: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapWatermarkText: {
    fontSize: 10,
    color: '#475569',
  },
  etaCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  etaStatus: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  etaTime: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 2,
  },
  otpCard: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  otpTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  otpSub: {
    fontSize: 12,
    color: '#78350F',
    textAlign: 'center',
    marginVertical: 4,
  },
  otpDigitsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '800',
    color: '#92400E',
  },
  mechanicCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  mechanicSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  mechanicVehicle: {
    fontSize: 12,
    color: '#1B5E20',
    marginTop: 2,
    fontWeight: '500',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  timeline: {
    gap: 16,
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1D5DB',
    marginRight: 14,
    marginTop: 3,
  },
  timelineDotDone: {
    backgroundColor: '#1B5E20',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  timelineDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
