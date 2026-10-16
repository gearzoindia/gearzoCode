import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge } from '@gearzo/ui';

export default function AuditLogsScreen() {
  const router = useRouter();

  const logs = [
    {
      id: 'log-1092',
      action: 'APPROVE_KYC_VERIFICATION',
      actor: 'vikram.ops@gearzo.in',
      target: 'Mechanic: Ramesh Kumar (m-101)',
      ip: '103.21.244.18',
      timestamp: 'Today, 10:42 AM',
    },
    {
      id: 'log-1091',
      action: 'AUTHORIZE_DISPUTE_REFUND',
      actor: 'praveen@gearzo.in (SUPER_ADMIN)',
      target: 'Order #GZ-88092 (₹1,499.00)',
      ip: '14.139.155.8',
      timestamp: 'Today, 09:15 AM',
    },
    {
      id: 'log-1090',
      action: 'REASSIGN_BOOKING_DISPATCH',
      actor: 'priya.support@gearzo.in',
      target: 'Order #GZ-88120 from m-104 to m-101',
      ip: '49.207.211.90',
      timestamp: 'Yesterday, 04:30 PM',
    },
    {
      id: 'log-1089',
      action: 'UPDATE_COMMISSION_TIER',
      actor: 'praveen@gearzo.in (SUPER_ADMIN)',
      target: 'Set Two-Wheeler Platform Fee to 10%',
      ip: '14.139.155.8',
      timestamp: '11 Oct 2026, 02:00 PM',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>System Audit Trail</Text>
          <Text style={styles.sub}>Immutable chronological event log of all privileged mutations</Text>
        </View>
        <Badge label="COMPLIANCE GRADE" variant="info" />
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.topRow}>
              <Text style={styles.logAction}>{item.action}</Text>
              <Text style={styles.time}>{item.timestamp}</Text>
            </View>

            <Text style={styles.target}>{item.target}</Text>
            <Text style={styles.meta}>
              Actor: {item.actor} • IP: {item.ip}
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
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
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B5E20',
    fontFamily: 'monospace',
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
  },
  target: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
  },
});
