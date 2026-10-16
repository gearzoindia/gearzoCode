import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';
import { useAcceptJobOffer, useRejectJobOffer } from '@gearzo/api-client';

export default function IncomingJobOfferScreen() {
  const router = useRouter();
  const { offerId } = useLocalSearchParams<{ offerId: string }>();

  const [countdown, setCountdown] = useState(30);

  const acceptMutation = useAcceptJobOffer();
  const rejectMutation = useRejectJobOffer();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.back();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const offer = {
    id: offerId || 'job-offer-demo',
    serviceName: 'Comprehensive 40-Point Periodic Service',
    vehicleSummary: 'Royal Enfield Classic 350',
    distanceKm: 2.4,
    address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru',
    payoutPaise: 119900,
  };

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync(offer.id);
    } catch {
      // Proceed
    }
    router.replace(`/job/${offer.id}/navigate`);
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({ offerId: offer.id, reason: 'Declined by partner' });
    } catch {
      // Proceed
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Ring Alert Header */}
        <View style={styles.ringPulseWrap}>
          <View style={styles.ringPulseOuter}>
            <View style={styles.ringPulseInner}>
              <Text style={{ fontSize: 40 }}>⚡</Text>
            </View>
          </View>
        </View>

        <Text style={styles.alertTitle}>New Doorstep Job Request!</Text>
        <Text style={styles.alertSub}>Auto-reassigns in {countdown} seconds</Text>

        {/* 30s Countdown Pill */}
        <View style={styles.timerPill}>
          <Text style={styles.timerText}>{countdown}s</Text>
        </View>

        {/* Offer Details Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutLabel}>Your Net Payout</Text>
              <Text style={styles.payoutValue}>
                ₹{(offer.payoutPaise / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <Badge label={`${offer.distanceKm} KM AWAY`} variant="info" />
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔧</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{offer.serviceName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🛵</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{offer.vehicleSummary}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Customer Location</Text>
              <Text style={styles.detailValue}>{offer.address}</Text>
            </View>
          </View>
        </Card>

        {/* Accept / Reject Buttons */}
        <View style={styles.btnRow}>
          <Button
            title="Reject"
            variant="danger"
            size="lg"
            style={{ flex: 1 }}
            loading={rejectMutation.isPending}
            onPress={handleReject}
          />
          <Button
            title="Accept Job ✓"
            variant="primary"
            size="lg"
            style={{ flex: 2, backgroundColor: '#1B5E20' }}
            loading={acceptMutation.isPending}
            onPress={handleAccept}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D3811',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    alignItems: 'center',
  },
  ringPulseWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  ringPulseOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPulseInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  alertSub: {
    fontSize: 13,
    color: '#C8E6C9',
    marginTop: 4,
  },
  timerPill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  payoutValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
