import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

export default function AdminBookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const booking = {
    id: id || 'GZ-88120',
    serviceName: 'Comprehensive 40-Point Periodic Service',
    status: 'IN_PROGRESS',
    customerName: 'Anand Verma',
    customerPhone: '+91 98765 43210',
    customerAddress: 'Villa 14, Palm Meadows, Whitefield, Bengaluru',
    mechanicName: 'Ramesh Kumar',
    mechanicPhone: '+91 98765 99881',
    mechanicRating: '4.89',
    vehicle: 'Royal Enfield Classic 350 (KA05MB9912)',
    basePricePaise: 119900,
    platformFeePaise: 4900,
    taxesPaise: 22400,
    totalPaise: 147200,
  };

  const handleReassign = () => {
    Alert.alert('Reassign Mechanic', 'Re-broadcasting job offer to nearest available mechanics.');
  };

  const handleCancelAndRefund = () => {
    Alert.alert('Cancel & Full Refund', 'Are you sure you want to cancel and initiate 100% refund?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Confirm Refund',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Refund Issued', '₹1,472.00 refunded to customer source account.');
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
        <Text style={styles.headerTitle}>Order #{booking.id}</Text>
        <Badge label={booking.status} variant="warning" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Customer & Mechanic Cards */}
        <View style={styles.gridRow}>
          <Card variant="default" style={styles.colCard}>
            <Text style={styles.cardHeader}>Customer</Text>
            <Text style={styles.mainName}>{booking.customerName}</Text>
            <Text style={styles.phone}>{booking.customerPhone}</Text>
            <Text style={styles.address}>{booking.customerAddress}</Text>
          </Card>

          <Card variant="default" style={styles.colCard}>
            <Text style={styles.cardHeader}>Assigned Mechanic</Text>
            <Text style={styles.mainName}>{booking.mechanicName}</Text>
            <Text style={styles.phone}>{booking.mechanicPhone} • ★ {booking.mechanicRating}</Text>
            <TouchableOpacity style={styles.reassignBtn} onPress={handleReassign}>
              <Text style={styles.reassignText}>Reassign Mechanic</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Vehicle & Service */}
        <Card variant="default" style={styles.card}>
          <Text style={styles.cardHeader}>Vehicle & Service Package</Text>
          <Text style={styles.vehicleTitle}>{booking.vehicle}</Text>
          <Text style={styles.serviceTitle}>{booking.serviceName}</Text>
        </Card>

        {/* Financial Breakdown */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardHeader}>Payment & Settlement</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Base Service Labor</Text>
            <Text style={styles.billValue}>₹{(booking.basePricePaise / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Convenience Fee</Text>
            <Text style={styles.billValue}>₹{(booking.platformFeePaise / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes (GST 18%)</Text>
            <Text style={styles.billValue}>₹{(booking.taxesPaise / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Captured</Text>
            <Text style={styles.totalValue}>₹{(booking.totalPaise / 100).toFixed(2)}</Text>
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
    minWidth: 260,
    padding: 16,
    borderRadius: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 6,
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
    lineHeight: 16,
  },
  reassignBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reassignText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceTitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
  },
});
