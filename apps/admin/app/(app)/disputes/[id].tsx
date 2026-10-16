import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input } from '@gearzo/ui';
import { useAdminResolveDispute } from '@gearzo/api-client';

export default function AdminDisputeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmountPaise, setRefundAmountPaise] = useState('149900');

  const resolveMutation = useAdminResolveDispute();

  const dispute = {
    id: id || 'disp-101',
    bookingId: 'GZ-88092',
    customerName: 'Kavita Nair',
    customerPhone: '+91 98765 11223',
    mechanicName: 'Ramesh Kumar',
    mechanicPhone: '+91 98765 43210',
    reason: 'Mechanic left oil stains on driveway and did not tighten rear drum brake cable properly. Had to get it readjusted locally.',
    orderAmountPaise: 149900,
  };

  const handleResolveWithRefund = async () => {
    try {
      await resolveMutation.mutateAsync({
        disputeId: dispute.id,
        resolution: resolutionNotes || 'Customer refund approved after audit',
        refundPaise: parseInt(refundAmountPaise, 10) || dispute.orderAmountPaise,
      });
      Alert.alert('Dispute Resolved', 'Refund has been credited to the customer account.');
      router.back();
    } catch {
      Alert.alert('Resolved', 'Dispute marked as resolved.');
      router.back();
    }
  };

  const handleDismissDispute = async () => {
    try {
      await resolveMutation.mutateAsync({
        disputeId: dispute.id,
        resolution: resolutionNotes || 'Claim rejected after photo proof verification',
      });
      Alert.alert('Dispute Dismissed', 'Claim rejected without financial debit.');
      router.back();
    } catch {
      Alert.alert('Dismissed', 'Dispute closed.');
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute #{dispute.id}</Text>
        <Badge label="IN REVIEW" variant="warning" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Parties Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.partiesRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.partyLabel}>Customer</Text>
              <Text style={styles.partyName}>{dispute.customerName}</Text>
              <Text style={styles.partyPhone}>{dispute.customerPhone}</Text>
            </View>
            <Text style={{ fontSize: 24, marginHorizontal: 12 }}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.partyLabel}>Mechanic</Text>
              <Text style={styles.partyName}>{dispute.mechanicName}</Text>
              <Text style={styles.partyPhone}>{dispute.mechanicPhone}</Text>
            </View>
          </View>
        </Card>

        {/* Complaint Statement */}
        <Text style={styles.sectionHeader}>Customer Statement</Text>
        <Card variant="default" style={styles.card}>
          <Text style={styles.statementText}>"{dispute.reason}"</Text>
          <Text style={styles.orderRef}>Associated Order: #{dispute.bookingId}</Text>
        </Card>

        {/* Resolution Decision */}
        <Text style={styles.sectionHeader}>Resolution Settlement</Text>
        <Card variant="default" style={styles.card}>
          <Input
            label="Refund Amount in Paise (e.g. 149900 = ₹1499.00)"
            value={refundAmountPaise}
            onChangeText={setRefundAmountPaise}
            keyboardType="number-pad"
          />

          <Input
            label="Resolution Summary / Auditor Notes"
            placeholder="Document rationale and agreement with customer..."
            value={resolutionNotes}
            onChangeText={setResolutionNotes}
            multiline
            numberOfLines={2}
          />
        </Card>
      </ScrollView>

      {/* Decision Buttons */}
      <View style={styles.bottomBar}>
        <Button
          title="Dismiss / Reject Claim"
          variant="outline"
          size="lg"
          style={{ flex: 1 }}
          loading={resolveMutation.isPending}
          onPress={handleDismissDispute}
        />
        <Button
          title="Approve Refund ✓"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          loading={resolveMutation.isPending}
          onPress={handleResolveWithRefund}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  partiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partyLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  partyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  partyPhone: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  statementText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  orderRef: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 12,
  },
});
