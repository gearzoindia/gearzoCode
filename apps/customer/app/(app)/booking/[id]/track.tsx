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
import { useBookingDetail } from '@gearzo/api-client';
import { LoadingScreen, ErrorScreen } from '@gearzo/ui';

type TrackingPhase = 'ASSIGNED' | 'ON_THE_WAY' | 'ARRIVED';

export default function TrackMechanicScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking, isLoading, isError, refetch } = useBookingDetail(id || '');

  // Toggle between Screen 17 (ASSIGNED), Screen 18 (ON_THE_WAY), Screen 19 (ARRIVED)
  const [phase, setPhase] = useState<TrackingPhase>('ASSIGNED');

  if (isLoading) {
    return <LoadingScreen message="Locating your assigned mechanic..." />;
  }

  if (isError || !booking) {
    return <ErrorScreen message="Could not fetch booking tracking details." onRetry={refetch} />;
  }

  const bookingId = (booking as any)?.code || booking.id || id || '';

  const mech = (booking as any).mechanic;
  const mechanic = mech
    ? {
        name: mech.name || 'Assigned Technician',
        rating: mech.rating?.toString() || '4.8',
        jobs: mech.jobsCompleted ? `${mech.jobsCompleted} jobs` : 'Gearzo Certified',
        exp: 'Verified Pro',
        phone: mech.phone || '',
        vehiclePlate: mech.vehiclePlate || 'Service Vehicle',
        vehicleType: mech.vehicleType || 'Two Wheeler',
      }
    : {
        name: 'Assigned Technician',
        rating: '4.8',
        jobs: 'Gearzo Certified',
        exp: 'Verified Pro',
        phone: '',
        vehiclePlate: 'Service Vehicle',
        vehicleType: 'Two Wheeler',
      };

  const bookingCode = (booking as any).code;
  const otp =
    (booking as any).startOtp ||
    (booking as any).otp ||
    (bookingCode ? bookingCode.replace(/\D/g, '').slice(-4).padStart(4, '0') : '4827');

  const handleCall = () => {
    if (mechanic.phone) {
      Linking.openURL(`tel:${mechanic.phone}`);
    } else {
      Alert.alert('Phone Support', 'Connecting via Gearzo in-app calling mask...');
    }
  };

  // ==========================================
  // SCREEN 19: MECHANIC ARRIVED (OTP)
  // ==========================================
  if (phase === 'ARRIVED') {
    return (
      <View style={styles.container}>
        {/* Dark Green Curved Header */}
        <View style={styles.curvedHeader}>
          <SafeAreaView edges={['top', 'left', 'right']}>
            <View style={styles.curvedHeaderTop}>
              <TouchableOpacity onPress={() => setPhase('ON_THE_WAY')} style={styles.backBtnLight}>
                <Text style={styles.backBtnTextLight}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.curvedHeaderTitle}>Mechanic arrived</Text>
              <View style={{ width: 32 }} />
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.arrivedContent}>
          {/* Overlapping Mechanic Card */}
          <View style={styles.overlappingMechanicCard}>
            <View style={styles.mechanicAvatarCircle}>
              <Text style={styles.avatarLetter}>R</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mechanicNameLarge}>{mechanic.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Text style={styles.starText}>★ {mechanic.rating}</Text>
                <Text style={styles.verifiedBadge}>· Verified 🛡️</Text>
              </View>
              <Text style={styles.plateSub}>
                {mechanic.vehiclePlate} · {mechanic.vehicleType}
              </Text>
            </View>
            <TouchableOpacity style={styles.callCircleBtn} onPress={handleCall}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>

          {/* OTP Section */}
          <Text style={styles.otpPromptTitle}>Share this OTP to start service</Text>

          {/* 4 OTP Digits */}
          <View style={styles.otpBoxesRow}>
            {otp.split('').map((digit: string, index: number) => (
              <View key={index} style={styles.otpDigitBox}>
                <Text style={styles.otpDigitText}>{digit}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.verifyNote}>
            Verify the mechanic's name and vehicle number before sharing the code.
          </Text>

          {/* Simulate transition to Screen 20: Service in progress */}
          <TouchableOpacity
            style={styles.startServiceBtn}
            onPress={() => router.replace(`/booking/${bookingId}/progress`)}
          >
            <Text style={styles.startServiceBtnText}>Mechanic Verified OTP → Start Service</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={styles.needHelpBtn}
            onPress={() => router.push('/profile/help')}
          >
            <Text style={styles.needHelpText}>Need help? Contact support</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // SCREEN 18: MECHANIC ON THE WAY
  // ==========================================
  if (phase === 'ON_THE_WAY') {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent', zIndex: 10 }}>
          {/* Top Bar with SOS */}
          <View style={styles.mapTopBar}>
            <TouchableOpacity onPress={() => setPhase('ASSIGNED')} style={styles.backCircleBtn}>
              <Text style={styles.backBtnText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.etaPill}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.etaPillText}>Arriving in 12 min · 3.2 km</Text>
            </View>
            <TouchableOpacity
              style={styles.sosCircleBtn}
              onPress={() => Alert.alert('Emergency Assistance', 'Connecting you with 24/7 GearZo Emergency Support...')}
            >
              <Text style={{ fontSize: 18 }}>⚠️</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Map View */}
        <View style={styles.liveMapContainer}>
          <View style={[styles.mapGridLine, { top: '30%', width: '100%' }]} />
          <View style={[styles.mapGridLine, { top: '60%', width: '100%' }]} />
          <View style={[styles.mapGridLineVertical, { left: '30%', height: '100%' }]} />
          <View style={[styles.mapGridLineVertical, { left: '70%', height: '100%' }]} />

          {/* Route Line */}
          <View style={styles.dottedRoute} />

          {/* Mechanic Dot "R" */}
          <View style={styles.mechanicMarkerPin}>
            <Text style={styles.markerLetter}>R</Text>
          </View>

          {/* Destination Pin */}
          <View style={styles.destinationMarkerPin}>
            <Text style={{ fontSize: 14 }}>📍</Text>
          </View>
        </View>

        {/* Bottom Sheet Card */}
        <View style={styles.onTheWayBottomSheet}>
          {/* Mechanic Row */}
          <View style={styles.mechanicRow}>
            <View style={styles.mechanicAvatarCircle}>
              <Text style={styles.avatarLetter}>R</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mechanicNameLarge}>{mechanic.name} is on the way</Text>
              <Text style={styles.mechanicMeta}>
                ★ {mechanic.rating} · {mechanic.vehiclePlate} · {mechanic.vehicleType}
              </Text>
            </View>
            <TouchableOpacity style={styles.callCircleBtn} onPress={handleCall}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>

          {/* Vertical Progress Mini Timeline */}
          <View style={styles.miniTimeline}>
            <View style={styles.miniTimelineRow}>
              <View style={styles.timelineDotDone} />
              <Text style={styles.miniTimelineTextDone}>Mechanic assigned · 4:14 PM</Text>
            </View>
            <View style={styles.miniTimelineLine} />
            <View style={styles.miniTimelineRow}>
              <View style={styles.timelineDotActive} />
              <Text style={styles.miniTimelineTextActive}>
                Mechanic on the way · Live location is being shared
              </Text>
            </View>
            <View style={styles.miniTimelineLine} />
            <View style={styles.miniTimelineRow}>
              <View style={styles.timelineDotPending} />
              <Text style={styles.miniTimelineTextPending}>Service in progress</Text>
            </View>
          </View>

          {/* 3 Quick Action Buttons: Chat, Share ETA, Safety */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => router.push('/profile/help')}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>🎧</Text>
              <Text style={styles.actionChipText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => Alert.alert('Share ETA', 'Tracking link copied to clipboard!')}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>➔</Text>
              <Text style={styles.actionChipText}>Share ETA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => Alert.alert('GearZo Safety', 'Mechanic is verified with background verification and police clearance.')}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>🛡️</Text>
              <Text style={styles.actionChipText}>Safety</Text>
            </TouchableOpacity>
          </View>

          {/* OTP Note & Next Step CTA */}
          <Text style={styles.otpReminderText}>
            Share the OTP <Text style={{ fontWeight: '800', color: '#0F1F16' }}>{otp}</Text> only when the mechanic arrives.
          </Text>

          <TouchableOpacity
            style={styles.arriveBtn}
            onPress={() => setPhase('ARRIVED')}
          >
            <Text style={styles.arriveBtnText}>Mechanic Arrived at Doorstep ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // SCREEN 17: MECHANIC ASSIGNED
  // ==========================================
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)/bookings')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking ID {bookingId}</Text>
        <TouchableOpacity onPress={() => setPhase('ON_THE_WAY')} style={{ padding: 6 }}>
          <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '800' }}>Next ›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Top Dark Green Card */}
        <View style={styles.assignedCard}>
          <Text style={styles.assignedSmall}>Booking confirmed</Text>
          <Text style={styles.assignedHeading}>Mechanic assigned</Text>
          <Text style={styles.assignedEta}>Rakesh arrives by 4:35 PM</Text>

          {/* OTP Pill */}
          <View style={styles.assignedOtpPill}>
            <Text style={styles.assignedOtpLabel}>OTP to start service</Text>
            <Text style={styles.assignedOtpValue}>{otp}</Text>
          </View>
        </View>

        {/* Map Preview Snippet */}
        <TouchableOpacity
          style={styles.mapSnippetBox}
          onPress={() => setPhase('ON_THE_WAY')}
          activeOpacity={0.9}
        >
          <View style={styles.mapSnippetRoad} />
          <View style={styles.mapSnippetPinStart} />
          <View style={styles.mapSnippetPinEnd} />
          <View style={styles.viewLiveMapOverlay}>
            <Text style={styles.viewLiveMapText}>Tap to View Live Route ›</Text>
          </View>
        </TouchableOpacity>

        {/* Vertical Timeline */}
        <View style={styles.timelineContainer}>
          {/* Booking confirmed */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotFilled} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.timelineTitle}>Booking confirmed</Text>
              <Text style={styles.timelineTime}>4:12 PM</Text>
            </View>
          </View>
          <View style={styles.timelineLineSolid} />

          {/* Payment received */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotFilled} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.timelineTitle}>Payment received</Text>
              <Text style={styles.timelineTime}>₹176 paid</Text>
            </View>
          </View>
          <View style={styles.timelineLineSolid} />

          {/* Mechanic assigned */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotCurrent} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.timelineTitleActive}>Mechanic assigned</Text>
              <Text style={styles.timelineSubText}>Rakesh · Verified</Text>
            </View>
          </View>
          <View style={styles.timelineLineDashed} />

          {/* Mechanic on the way */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotPending} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.timelineTitlePending}>Mechanic on the way</Text>
            </View>
          </View>
          <View style={styles.timelineLineDashed} />

          {/* Service completed */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotPending} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.timelineTitlePending}>Service completed</Text>
            </View>
          </View>
        </View>

        {/* Mechanic Card */}
        <View style={styles.mechanicFooterCard}>
          <View style={styles.mechanicAvatarCircle}>
            <Text style={styles.avatarLetter}>R</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mechanicNameLarge}>{mechanic.name}</Text>
            <Text style={styles.mechanicMeta}>
              ★ {mechanic.rating} · {mechanic.jobs} · {mechanic.exp}
            </Text>
          </View>
          <TouchableOpacity style={styles.callCircleBtn} onPress={handleCall}>
            <Text style={{ fontSize: 18 }}>📞</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions: Cancel & Chat/Help */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={styles.cancelBtnOutline}
          onPress={() => router.replace('/(app)/(tabs)/bookings')}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatHelpBtn}
          onPress={() => setPhase('ON_THE_WAY')}
        >
          <Text style={styles.chatHelpBtnText}>Track On The Way ›</Text>
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
  assignedCard: {
    backgroundColor: '#0B4A27',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  assignedSmall: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  assignedHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  assignedEta: {
    color: '#E5E7EB',
    fontSize: 12,
    marginBottom: 12,
  },
  assignedOtpPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedOtpLabel: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '600',
  },
  assignedOtpValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  mapSnippetBox: {
    height: 100,
    backgroundColor: '#E8F5EE',
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSnippetRoad: {
    position: 'absolute',
    width: '80%',
    height: 3,
    backgroundColor: '#16A34A',
    borderStyle: 'dashed',
  },
  mapSnippetPinStart: {
    position: 'absolute',
    left: '20%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
  },
  mapSnippetPinEnd: {
    position: 'absolute',
    right: '20%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0B4A27',
  },
  viewLiveMapOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  viewLiveMapText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B4A27',
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDotFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
  },
  timelineDotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
  },
  timelineDotPending: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  timelineLineSolid: {
    width: 2,
    height: 18,
    backgroundColor: '#16A34A',
    marginLeft: 6,
  },
  timelineLineDashed: {
    width: 2,
    height: 18,
    backgroundColor: '#D1D5DB',
    marginLeft: 6,
  },
  timelineTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  timelineTime: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 1,
  },
  timelineTitleActive: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  timelineSubText: {
    fontSize: 10.5,
    color: '#16A34A',
    marginTop: 1,
  },
  timelineTitlePending: {
    fontSize: 12.5,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  mechanicFooterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#0B4A27',
    fontSize: 18,
    fontWeight: '800',
  },
  mechanicNameLarge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
  },
  mechanicMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  callCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActionBar: {
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
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#0F1F16',
    fontSize: 13,
    fontWeight: '700',
  },
  chatHelpBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chatHelpBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Screen 18 Styles
  mapTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  greenLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  etaPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  sosCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveMapContainer: {
    flex: 1,
    backgroundColor: '#E8F5EE',
    position: 'relative',
  },
  mapGridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#C7E8D3',
  },
  mapGridLineVertical: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#C7E8D3',
  },
  dottedRoute: {
    position: 'absolute',
    left: '32%',
    top: '40%',
    width: '38%',
    height: 2,
    backgroundColor: '#16A34A',
  },
  mechanicMarkerPin: {
    position: 'absolute',
    left: '28%',
    top: '36%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLetter: {
    color: '#0B4A27',
    fontWeight: '800',
    fontSize: 14,
  },
  destinationMarkerPin: {
    position: 'absolute',
    right: '28%',
    top: '36%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onTheWayBottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 8,
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  miniTimeline: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  miniTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDotDone: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 8,
  },
  miniTimelineTextDone: {
    fontSize: 11,
    color: '#6B7280',
  },
  timelineDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 8,
  },
  miniTimelineTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  miniTimelineTextPending: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  miniTimelineLine: {
    width: 1,
    height: 10,
    backgroundColor: '#D1D5DB',
    marginLeft: 3.5,
    marginVertical: 2,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 8,
  },
  actionChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  otpReminderText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  arriveBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  arriveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Screen 19 Styles
  curvedHeader: {
    backgroundColor: '#0B4A27',
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  curvedHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnLight: {
    paddingHorizontal: 6,
  },
  backBtnTextLight: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  curvedHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  arrivedContent: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -28,
  },
  overlappingMechanicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  starText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
  },
  plateSub: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
  },
  otpPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1F16',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  otpDigitBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#E3F6EA',
    borderWidth: 1.5,
    borderColor: '#8ADBAA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigitText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0B4A27',
  },
  verifyNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
    marginBottom: 24,
  },
  startServiceBtn: {
    backgroundColor: '#0B4A27',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  startServiceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  needHelpBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  needHelpText: {
    color: '#16A34A',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
