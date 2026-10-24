import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useAcceptJobOffer, useRejectJobOffer, useMechanicJobDetail } from '@gearzo/api-client';

export default function IncomingJobOfferScreen() {
  const router = useRouter();
  const { offerId } = useLocalSearchParams<{ offerId: string }>();

  const [countdown, setCountdown] = useState(30);

  const { data: job, isLoading } = useMechanicJobDetail(offerId || '');
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
  }, [router]);

  if (isLoading) {
    return <LoadingScreen message="Loading Dispatch Offer..." />;
  }

  if (!job && offerId !== 'demo') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 20 }}>
          <EmptyState
            icon="⌛"
            title="Offer Expired"
            description="This dispatch offer has expired or was accepted by another partner."
            actionTitle="Back to Dashboard"
            onAction={() => router.replace('/(app)/(tabs)')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const payoutPaise = job ? Math.round((job.totalAmountPaise || job.servicePricePaise || 0) * 0.9) : 0;

  const handleAccept = async () => {
    try {
      if (offerId) {
        await acceptMutation.mutateAsync(offerId);
      }
    } catch {
      // Proceed
    }
    router.replace(`/job/${offerId}/navigate`);
  };

  const handleReject = async () => {
    try {
      if (offerId) {
        await rejectMutation.mutateAsync({ offerId, reason: 'Declined by partner' });
      }
    } catch {
      // Proceed
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Urgent Header Ring */}
        <View style={styles.topSection}>
          <View style={styles.pulseCircle}>
            <Text style={styles.countdownText}>{countdown}s</Text>
          </View>
          <Text style={styles.alertTitle}>New Nearby Job Request! 🚨</Text>
          <Text style={styles.alertSub}>Customer waiting for doorstep service dispatch</Text>
        </View>

        {/* Offer Details Card */}
        <Card variant="elevated" style={styles.offerCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated Partner Payout</Text>
            <Text style={styles.priceValue}>
              ₹{(payoutPaise / 100).toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🔧</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Required Service</Text>
              <Text style={styles.detailValue}>{job?.serviceName || 'Periodic Service'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏍️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{job?.vehicleSummary || 'Vehicle Details'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Service Location</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {job?.address || 'Customer Location'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <View style={{ flex: 1 }}>
            <Button
              title="Decline ✕"
              variant="outline"
              size="lg"
              loading={rejectMutation.isPending}
              onPress={handleReject}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              title="Accept Order ✓"
              variant="primary"
              size="lg"
              loading={acceptMutation.isPending}
              onPress={handleAccept}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#22C55E',
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  alertSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  offerCard: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  priceRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4ADE80',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailIcon: {
    fontSize: 22,
    width: 36,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
  },
});
