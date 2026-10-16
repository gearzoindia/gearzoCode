import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';
import { useAdminPayouts } from '@gearzo/api-client';

export default function AdminPayoutsScreen() {
  const router = useRouter();
  const { data: payouts } = useAdminPayouts();

  const mockRuns = [
    {
      id: 'payout-run-2026-10-12',
      period: '12 Oct 2026 (Daily Auto-Run)',
      mechanicsCount: 42,
      totalPaise: 9480000,
      status: 'COMPLETED',
      settlementTime: '12 Oct, 11:30 PM',
    },
    {
      id: 'payout-run-2026-10-11',
      period: '11 Oct 2026 (Daily Auto-Run)',
      mechanicsCount: 38,
      totalPaise: 8120000,
      status: 'COMPLETED',
      settlementTime: '11 Oct, 11:30 PM',
    },
  ];

  const handleInitiateManualRun = () => {
    Alert.alert('Batch Run Triggered', 'Processing automated IMPS batch disbursements with bank gateway.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Partner Bank Payouts</Text>
          <Text style={styles.sub}>Daily automated NEFT/IMPS settlement runs to mechanic bank accounts</Text>
        </View>

        <Button
          title="Run Manual Batch 🚀"
          variant="primary"
          size="sm"
          onPress={handleInitiateManualRun}
        />
      </View>

      <FlatList
        data={mockRuns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/finance/payouts/${item.id}`)}
              style={styles.content}
            >
              <View style={styles.topRow}>
                <Text style={styles.period}>{item.period}</Text>
                <Badge label={item.status} variant="success" />
              </View>

              <Text style={styles.meta}>
                {item.mechanicsCount} Mechanics Disbursed • {item.settlementTime}
              </Text>

              <View style={styles.bottomRow}>
                <Text style={styles.amount}>
                  Total Disbursed: ₹{(item.totalPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.viewLink}>View Breakdown →</Text>
              </View>
            </TouchableOpacity>
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
    marginBottom: 12,
  },
  content: {},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  period: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  viewLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
});
