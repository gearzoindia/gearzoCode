import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useAdminDisputeDetail, useAdminResolveDispute } from '@gearzo/api-client';

export default function AdminDisputeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: dispute, isLoading, error } = useAdminDisputeDetail(id || '');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmountPaise, setRefundAmountPaise] = useState('');

  const resolveMutation = useAdminResolveDispute();

  if (isLoading) {
    return <LoadingScreen message="Loading dispute record..." />;
  }

  if (error || !dispute) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dispute Investigation</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <EmptyState
            title="Dispute Not Found"
            description="The requested dispute record could not be loaded from the database."
            buttonTitle="Return to Inbox"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const customerName = dispute.booking?.customer?.name || dispute.booking?.customer?.phone || 'Customer';
  const customerPhone = dispute.booking?.customer?.phone || 'No phone';
  const mechanicName = dispute.booking?.mechanic?.name || dispute.booking?.mechanic?.phone || 'Mechanic';
  const mechanicPhone = dispute.booking?.mechanic?.phone || 'No phone';
  const bookingCode = dispute.booking?.code || dispute.bookingId || 'N/A';
  const claimPaise = dispute.claimAmountPaise || dispute.amountPaise || 0;

  const handleResolveWithRefund = async () => {
    try {
      await resolveMutation.mutateAsync({
        disputeId: dispute.id,
        resolution: resolutionNotes || 'Customer refund approved after audit',
        refundPaise: parseInt(refundAmountPaise, 10) || claimPaise,
      });
      Alert.alert('Dispute Resolved', 'Refund has been approved and logged.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not resolve dispute.');
    }
  };

  const handleDismissDispute = async () => {
    try {
      await resolveMutation.mutateAsync({
        disputeId: dispute.id,
        resolution: resolutionNotes || 'Claim rejected after audit verification',
      });
      Alert.alert('Dispute Dismissed', 'Claim rejected without debit.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not dismiss dispute.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute #{dispute.id.slice(0, 8)}</Text>
        <Badge
          label={dispute.status || 'OPEN'}
          variant={dispute.status === 'RESOLVED' ? 'success' : dispute.status === 'REJECTED' ? 'neutral' : 'error'}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Parties Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.partiesRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.partyLabel}>Customer</Text>
              <Text style={styles.partyName}>{customerName}</Text>
              <Text style={styles.partyPhone}>{customerPhone}</Text>
            </View>
            <Text style={{ fontSize: 24, marginHorizontal: 12 }}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.partyLabel}>Mechanic</Text>
              <Text style={styles.partyName}>{mechanicName}</Text>
              <Text style={styles.partyPhone}>{mechanicPhone}</Text>
            </View>
          </View>
        </Card>

        {/* Complaint Statement */}
        <Text style={styles.sectionHeader}>Complaint Details</Text>
        <Card variant="default" style={styles.card}>
          <Text style={styles.statementText}>"{dispute.reason || 'No description provided'}"</Text>
          <Text style={styles.orderRef}>Associated Order: #{bookingCode}</Text>
          {claimPaise > 0 && (
            <Text style={[styles.orderRef, { color: '#EF4444', fontWeight: '700' }]}>
              Claimed Amount: ₹{(claimPaise / 100).toFixed(2)}
            </Text>
          )}
        </Card>

        {/* Resolution Decision */}
        {dispute.status === 'OPEN' && (
          <>
            <Text style={styles.sectionHeader}>Resolution Settlement</Text>
            <Card variant="default" style={styles.card}>
              <Input
                label={`Refund Amount in Paise (Default: ₹${(claimPaise / 100).toFixed(2)})`}
                placeholder={claimPaise.toString()}
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
          </>
        )}
      </ScrollView>

      {/* Decision Buttons */}
      {dispute.status === 'OPEN' && (
        <View style={styles.bottomBar}>
          <Button
            title="Dismiss / Reject Claim"
            variant="outline"
            size="lg"
            style={{ flex: 1 }}
            disabled={resolveMutation.isPending}
            onPress={handleDismissDispute}
          />
          <Button
            title="Approve Refund ✓"
            variant="primary"
            size="lg"
            style={{ flex: 1 }}
            disabled={resolveMutation.isPending}
            onPress={handleResolveWithRefund}
          />
        </View>
      )}
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
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  partiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  partyName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  partyPhone: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  statementText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#1E293B',
    lineHeight: 22,
  },
  orderRef: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
});
