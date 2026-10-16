import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';
import { useAdminRefunds } from '@gearzo/api-client';

export default function AdminRefundsScreen() {
  const router = useRouter();
  const { data: refunds } = useAdminRefunds();

  const mockRefunds = [
    {
      id: 'ref-901',
      bookingId: 'GZ-88092',
      customerName: 'Kavita Nair',
      amountPaise: 149900,
      reason: 'Dispute settlement - quality dissatisfaction',
      status: 'PROCESSED',
      date: '12 Oct 2026, 04:15 PM',
    },
    {
      id: 'ref-902',
      bookingId: 'GZ-87501',
      customerName: 'Arjun Das',
      amountPaise: 49900,
      reason: 'Mechanic unavailable within dispatch ETA',
      status: 'PROCESSED',
      date: '11 Oct 2026, 11:30 AM',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Refunds & Adjustments</Text>
          <Text style={styles.sub}>Customer reversals, cancelled order refunds & chargebacks</Text>
        </View>
      </View>

      <FlatList
        data={mockRefunds}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.topRow}>
              <Text style={styles.refCode}>#{item.id} • Order #{item.bookingId}</Text>
              <Badge label={item.status} variant="success" />
            </View>
            <Text style={styles.customer}>{item.customerName}</Text>
            <Text style={styles.reason}>{item.reason}</Text>
            <View style={styles.bottomRow}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.amount}>₹{(item.amountPaise / 100).toFixed(2)}</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  refCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  customer: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  reason: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  date: {
    fontSize: 11,
    color: '#94A3B8',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B91C1C',
  },
});
