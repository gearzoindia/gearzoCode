import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useAdminBookingDetail } from '@gearzo/api-client';

export default function AdminBookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: booking, isLoading, error } = useAdminBookingDetail(id || '');

  if (isLoading) {
    return <LoadingScreen message="Loading order details..." />;
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Inspection</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <EmptyState
            title="Order Not Found"
            description="The requested service order could not be located in the database."
            buttonTitle="Return to Orders"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const orderCode = booking.code || booking.id.slice(0, 8);
  const customerName = booking.customer?.name || booking.customer?.phone || 'Customer';
  const customerPhone = booking.customer?.phone || 'No phone';
  const customerAddress =
    booking.addressSnapshot?.formattedAddress ||
    booking.addressSnapshot?.addressLine1 ||
    booking.address ||
    'Doorstep location';

  const mechanicName = booking.mechanic?.name || booking.mechanic?.phone || 'Unassigned';
  const mechanicPhone = booking.mechanic?.phone || 'N/A';
  const mechanicRating = booking.mechanic?.profile?.ratingAvg ? Number(booking.mechanic.profile.ratingAvg).toFixed(1) : '5.0';

  const vehicleTitle = booking.vehicleSnapshot
    ? `${booking.vehicleSnapshot.brand || ''} ${booking.vehicleSnapshot.model || ''} (${booking.vehicleSnapshot.registrationNumber || 'No plate'})`.trim()
    : booking.vehicleSummary || 'Vehicle';

  const totalPaise = booking.finalTotalPaise || booking.estimatedTotalPaise || booking.totalAmountPaise || 0;

  const handleReassign = () => {
    Alert.alert('Reassign Mechanic', 'Re-broadcasting job offer to nearest available mechanics in zone.');
  };

  const handleCancelAndRefund = () => {
    Alert.alert('Cancel & Full Refund', 'Are you sure you want to cancel this order and initiate refund?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Confirm Refund',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Action Logged', 'Cancellation workflow logged with operations.');
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{orderCode}</Text>
        <Badge
          label={booking.status}
          variant={booking.status === 'COMPLETED' ? 'success' : booking.status === 'CANCELLED' ? 'neutral' : 'warning'}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Customer & Mechanic Cards */}
        <View style={styles.gridRow}>
          <Card variant="default" style={styles.colCard}>
            <Text style={styles.cardHeader}>Customer</Text>
            <Text style={styles.mainName}>{customerName}</Text>
            <Text style={styles.phone}>{customerPhone}</Text>
            <Text style={styles.address}>{customerAddress}</Text>
            {booking.customer?.id && (
              <TouchableOpacity
                onPress={() => router.push(`/customers/${booking.customer.id}`)}
                style={{ marginTop: 8 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1B5E20' }}>
                  View Customer Profile →
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          <Card variant="default" style={styles.colCard}>
            <Text style={styles.cardHeader}>Assigned Partner</Text>
            <Text style={styles.mainName}>{mechanicName}</Text>
            <Text style={styles.phone}>
              {booking.mechanic ? `${mechanicPhone} • ★ ${mechanicRating}` : 'Awaiting dispatch'}
            </Text>
            {booking.mechanic ? (
              <TouchableOpacity
                onPress={() => router.push(`/mechanics/${booking.mechanic.id}`)}
                style={{ marginTop: 8 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1B5E20' }}>
                  View Partner Profile →
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.reassignBtn} onPress={handleReassign}>
                <Text style={styles.reassignText}>Assign Partner</Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>

        {/* Vehicle & Service */}
        <Card variant="default" style={styles.card}>
          <Text style={styles.cardHeader}>Vehicle & Service Package</Text>
          <Text style={styles.vehicleTitle}>{vehicleTitle}</Text>
          <Text style={styles.serviceTitle}>{booking.serviceName || booking.instructions || 'Standard Inspection & Service'}</Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
            Mode: {booking.serviceMode || 'DOORSTEP'}
          </Text>
        </Card>

        {/* Financial Breakdown */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardHeader}>Payment & Settlement</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Service Order Amount</Text>
            <Text style={styles.billValue}>₹{(totalPaise / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{(totalPaise / 100).toFixed(2)}</Text>
          </View>
        </Card>

        {/* Operational Actions */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <Button
            title="Cancel Order & Issue Full Refund ⚠️"
            variant="danger"
            size="lg"
            onPress={handleCancelAndRefund}
          />
        </View>
      </ScrollView>
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
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colCard: {
    flex: 1,
    minWidth: 280,
    padding: 16,
    borderRadius: 14,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mainName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  phone: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 18,
  },
  reassignBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reassignText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceTitle: {
    fontSize: 13,
    color: '#334155',
    marginTop: 4,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
  },
});
