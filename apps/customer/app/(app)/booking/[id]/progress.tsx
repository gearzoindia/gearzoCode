import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingDetail } from '@gearzo/api-client';
import { LoadingScreen, ErrorScreen } from '@gearzo/ui';

export default function ServiceInProgressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking, isLoading, isError, refetch } = useBookingDetail(id || '');

  // Elapsed timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [extraWorkStatus, setExtraWorkStatus] = useState<'PENDING' | 'APPROVED' | 'DECLINED'>('PENDING');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Loading live service progress..." />;
  }

  if (isError || !booking) {
    return <ErrorScreen message="Could not load booking progress." onRetry={refetch} />;
  }

  const bookingId = (booking as any)?.code || booking.id || id || '';
  const mechanicObj = (booking as any).mechanic;
  const mechanicName = mechanicObj?.name ? mechanicObj.name.split(' ')[0] : 'Mechanic';

  const hours = Math.floor(secondsElapsed / 3600);
  const minutes = Math.floor((secondsElapsed % 3600) / 60);
  const seconds = secondsElapsed % 60;
  const elapsedStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const checklist = [
    { title: booking.serviceName || 'Engine diagnostic check', status: 'In progress', done: false },
    { title: 'Fluid level verification & inspection', status: 'Pending', done: false },
    { title: 'Electrical system & battery safety test', status: 'Pending', done: false },
    { title: 'Brake wear & tyre pressure calibration', status: 'Pending', done: false },
  ];

  const handleApprove = () => {
    setExtraWorkStatus('APPROVED');
    Alert.alert('Extra Work Approved', '₹350 has been approved for Front Brake Pad Replacement. It has been added to your bill.');
  };

  const handleDecline = () => {
    setExtraWorkStatus('DECLINED');
    Alert.alert('Extra Work Declined', 'The technician will proceed without replacing the front brake pads.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking ID {bookingId}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Top Dark Green Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressSmall}>Service in progress</Text>
          <Text style={styles.progressHeading}>{mechanicName} is working on your vehicle</Text>
          <Text style={styles.progressSub}>
            Elapsed {elapsedStr}
          </Text>
        </View>

        {/* SERVICE CHECKLIST */}
        <Text style={styles.sectionTitle}>SERVICE CHECKLIST</Text>
        <View style={styles.checklistCard}>
          {checklist.map((item, index) => (
            <View key={index}>
              <View style={styles.checkRow}>
                <View style={[styles.checkCircle, item.done ? styles.checkDone : styles.checkInProgress]}>
                  <Text style={[styles.checkSign, item.done && { color: '#16A34A' }]}>
                    {item.done ? '✓' : '○'}
                  </Text>
                </View>
                <Text style={styles.checkTitle}>{item.title}</Text>
                <Text
                  style={[
                    styles.checkStatusText,
                    item.done ? { color: '#6B7280' } : { color: '#16A34A', fontWeight: '700' },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              {index < checklist.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Amber Alert Card: Extra work found */}
        <View style={styles.amberAlertCard}>
          <Text style={styles.alertHeading}>Extra work found: approval needed</Text>
          <Text style={styles.alertDesc}>
            Front brake pads are worn out (3.2 mm left). Replacement is recommended for safe riding.
          </Text>

          {/* Item Row */}
          <View style={styles.extraItemRow}>
            <View style={styles.extraIconWrap}>
              <Text style={{ fontSize: 18 }}>🔧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.extraItemName}>Brake pad replacement</Text>
              <Text style={styles.extraItemMeta}>Photo attached · 1 set</Text>
            </View>
            <Text style={styles.extraItemPrice}>₹350</Text>
          </View>

          {/* Actions */}
          {extraWorkStatus === 'PENDING' ? (
            <View style={styles.alertActionsRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
                <Text style={styles.approveBtnText}>Approve ₹350</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.statusFeedbackPill, extraWorkStatus === 'APPROVED' ? styles.statusApproved : styles.statusDeclined]}>
              <Text style={styles.statusFeedbackText}>
                {extraWorkStatus === 'APPROVED' ? '✓ Approved (+₹350 added to invoice)' : '✕ Declined by customer'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Complete Service CTA Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => router.push(`/booking/${bookingId}/invoice`)}
          activeOpacity={0.9}
        >
          <Text style={styles.completeBtnText}>Complete Service & View Bill ›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    paddingHorizontal: 6,
  },
  backBtnText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F1F16',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1F16',
  },
  progressCard: {
    backgroundColor: '#0B4A27',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  progressSmall: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  progressSub: {
    color: '#E5E7EB',
    fontSize: 11.5,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkDone: {
    backgroundColor: '#DCFCE7',
  },
  checkInProgress: {
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  checkSign: {
    fontSize: 12,
    fontWeight: '800',
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F1F16',
    flex: 1,
  },
  checkStatusText: {
    fontSize: 11.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  amberAlertCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
  },
  alertHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
    marginBottom: 14,
  },
  extraItemRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  extraIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  extraItemName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  extraItemMeta: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  extraItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
  },
  alertActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  declineBtnText: {
    color: '#374151',
    fontSize: 12.5,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  statusFeedbackPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusDeclined: {
    backgroundColor: '#FEE2E2',
  },
  statusFeedbackText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  completeBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
