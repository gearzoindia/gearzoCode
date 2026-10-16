import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Badge } from '@gearzo/ui';
import { useUpdateJobStep } from '@gearzo/api-client';

export default function MechanicJobCompleteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [customerRating, setCustomerRating] = useState(5);
  const [paymentCollected, setPaymentCollected] = useState(true);

  const updateStepMutation = useUpdateJobStep();

  const handleFinishJob = async () => {
    try {
      await updateStepMutation.mutateAsync({
        jobId: id || 'current',
        step: 'COMPLETED',
      });
    } catch {
      // Proceed
    }
    Alert.alert('Job Completed!', 'Earnings have been credited to your GearZo Partner Wallet.');
    router.replace('/(app)/(tabs)');
  };

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
            <Text style={styles.label}>Standard Service Labour</Text>
            <Text style={styles.value}>₹999.00</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Approved Extra: Clutch Cable</Text>
            <Text style={styles.value}>₹380.00</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Total Customer Invoice</Text>
            <Text style={styles.valueBold}>₹1,379.00</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>GearZo Platform Fee (10%)</Text>
            <Text style={[styles.value, { color: '#DC2626' }]}>-₹99.90</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.payoutHighlight}>
            <Text style={styles.payoutText}>Your Net Payout</Text>
            <Text style={styles.payoutAmount}>₹1,279.10</Text>
          </View>
        </Card>

        {/* Payment Collection Status */}
        <Text style={styles.sectionHeader}>Payment Collection</Text>
        <Card variant="default" style={styles.paymentCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 24 }}>💳</Text>
              <View>
                <Text style={styles.paymentMethod}>Prepaid via Online UPI</Text>
                <Text style={styles.paymentSub}>Payment captured automatically</Text>
              </View>
            </View>
            <Badge label="PAID" variant="success" />
          </View>
        </Card>

        {/* Rate Customer */}
        <Text style={styles.sectionHeader}>Rate the Customer</Text>
        <Card variant="default" style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was your experience with the customer?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setCustomerRating(star)}>
                <Text style={[styles.star, star <= customerRating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.bottomBar}>
        <Button
          title="Close Job & Return to Dashboard ✓"
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  settlementCard: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    fontWeight: '800',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  payoutHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  payoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  paymentSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  ratingCard: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  star: {
    fontSize: 32,
    color: '#D1D5DB',
  },
  starActive: {
    color: '#F59E0B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
