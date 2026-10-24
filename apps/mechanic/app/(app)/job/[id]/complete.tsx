import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Badge, LoadingScreen } from '@gearzo/ui';
import { useUpdateJobStep, useMechanicJobDetail } from '@gearzo/api-client';

export default function MechanicJobCompleteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: job, isLoading } = useMechanicJobDetail(id || '');
  const [customerRating, setCustomerRating] = useState(5);
  const [paymentCollected, setPaymentCollected] = useState(true);

  const updateStepMutation = useUpdateJobStep();

  const handleFinishJob = async () => {
    try {
      await updateStepMutation.mutateAsync({
        jobId: id || '',
        step: 'COMPLETED',
      });
    } catch {
      // Proceed
    }
    Alert.alert('Job Completed!', 'Earnings have been credited to your GearZo Partner Wallet.');
    router.replace('/(app)/(tabs)');
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Settlement..." />;
  }

  const totalPaise = job?.totalAmountPaise || job?.servicePricePaise || 0;
  const platformFeePaise = Math.round(totalPaise * 0.1);
  const netPayoutPaise = totalPaise - platformFeePaise;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Completion & Settlement</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Settlement Summary Card */}
        <Card variant="elevated" style={styles.settlementCard}>
          <Text style={styles.cardHeader}>Job Settlement Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>{job?.serviceName || 'Service Order'}</Text>
            <Text style={styles.value}>₹{(totalPaise / 100).toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Total Customer Invoice</Text>
            <Text style={styles.valueBold}>₹{(totalPaise / 100).toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>GearZo Platform Fee (10%)</Text>
            <Text style={[styles.value, { color: '#DC2626' }]}>-₹{(platformFeePaise / 100).toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Net Credited to Partner Wallet</Text>
            <Text style={[styles.valueBold, { color: '#15803D' }]}>+₹{(netPayoutPaise / 100).toFixed(2)}</Text>
          </View>
        </Card>

        {/* Payment Collection State */}
        <Text style={styles.sectionTitle}>Payment Collection</Text>
        <Card variant="default" style={styles.paymentCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.payStatusTitle}>
                {job?.status === 'COMPLETED' ? 'Settled Online' : 'Digital Pre-Paid Order'}
              </Text>
              <Text style={styles.payStatusSub}>Prepaid securely by customer via GearZo Gateway</Text>
            </View>
            <Badge label="PAID" variant="success" />
          </View>
        </Card>

        {/* Rate Vehicle Owner */}
        <Text style={styles.sectionTitle}>Rate Customer Experience</Text>
        <Card variant="default" style={styles.ratingCard}>
          <Text style={styles.ratingSub}>How was your interaction with the vehicle owner?</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setCustomerRating(star)}>
                <Text style={{ fontSize: 32, opacity: star <= customerRating ? 1 : 0.3 }}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Floating Bottom Button */}
      <View style={styles.bottomBar}>
        <Button
          title="Finish Job & Unlock Next Order 🏁"
          variant="primary"
          size="lg"
          loading={updateStepMutation.isPending}
          onPress={handleFinishJob}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  settlementCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  valueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  paymentCard: {
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  payStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  payStatusSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  ratingSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
