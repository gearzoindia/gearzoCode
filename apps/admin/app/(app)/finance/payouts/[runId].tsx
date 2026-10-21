import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useAdminPayoutRunDetail } from '@gearzo/api-client';

export default function PayoutRunDetailScreen() {
  const router = useRouter();
  const { runId } = useLocalSearchParams<{ runId: string }>();

  const { data: run, isLoading, error } = useAdminPayoutRunDetail(runId || '');

  if (isLoading) {
    return <LoadingScreen message="Loading payout run details..." />;
  }

  if (error || !run) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payout Settlement</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <EmptyState
            title="Batch Not Found"
            description="The requested settlement batch could not be retrieved from the database."
            buttonTitle="Return to Payouts"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const items = Array.isArray(run.items) ? run.items : Array.isArray(run.payouts) ? run.payouts : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batch: {run.id?.slice(0, 12) || runId}</Text>
        <Badge label={run.status || 'SETTLED'} variant="success" />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id || item.mechanicId || index.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>💳</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>No Disbursements</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              No individual partner transactions recorded in this batch.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.mechanic?.name || item.name || 'Mechanic Partner'}</Text>
                <Text style={styles.bank}>
                  {item.bankRef || item.accountNumber || 'Bank Transfer'} • UTR: {item.utr || 'Pending'}
                </Text>
              </View>
              <Text style={styles.amount}>
                ₹{((item.amountPaise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
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
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  bank: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
  },
});
