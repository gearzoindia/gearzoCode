import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, EmptyState } from '@gearzo/ui';
import { useMechanicEarnings, useMechanicLedger } from '@gearzo/api-client';

export default function MechanicEarningsTab() {
  const { data: earnings, refetch: refetchEarnings, isRefetching: isRefetchingEarnings } = useMechanicEarnings();
  const { data: ledgerData, refetch: refetchLedger, isRefetching: isRefetchingLedger } = useMechanicLedger();

  const ledgerEntries = ledgerData?.entries || [];

  const handleWithdraw = () => {
    if (walletPaise <= 0) {
      Alert.alert('No Balance', 'You currently do not have any withdrawable balance in your wallet.');
      return;
    }
    Alert.alert(
      'Withdrawal Request Initiated',
      `₹${(walletPaise / 100).toFixed(2)} will be transferred to your registered bank account via instant IMPS.`
    );
  };

  const handleRefresh = async () => {
    await Promise.all([refetchEarnings(), refetchLedger()]);
  };

  const walletPaise = earnings?.walletBalancePaise || 0;
  const todayPaise = earnings?.todayPaise || 0;
  const thisWeekPaise = earnings?.thisWeekPaise || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings & Payout Ledger</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingEarnings || isRefetchingLedger}
            onRefresh={handleRefresh}
            tintColor="#1B5E20"
          />
        }
      >
        {/* Main Wallet Card */}
        <Card variant="elevated" style={styles.mainCard}>
          <Text style={styles.mainLabel}>Available for Immediate Payout</Text>
          <Text style={styles.mainAmount}>
            ₹{(walletPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>

          <View style={styles.bankTag}>
            <Text style={{ fontSize: 13, color: '#1B5E20', fontWeight: '700' }}>
              🏦 Instant IMPS Transfer Enabled
            </Text>
          </View>

          <Button
            title="Request Instant Payout →"
            variant="primary"
            size="md"
            disabled={walletPaise <= 0}
            onPress={handleWithdraw}
            style={{ marginTop: 14 }}
          />
        </Card>

        {/* Breakdown Metric Cards */}
        <Text style={styles.sectionHeader}>Performance Periods</Text>
        <View style={styles.periodRow}>
          <Card variant="default" style={styles.periodCard}>
            <Text style={styles.periodLabel}>Today</Text>
            <Text style={styles.periodValue}>
              ₹{(todayPaise / 100).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.periodSub}>{earnings?.completedJobsCount || 0} jobs done</Text>
          </Card>

          <Card variant="default" style={styles.periodCard}>
            <Text style={styles.periodLabel}>This Week</Text>
            <Text style={styles.periodValue}>
              ₹{(thisWeekPaise / 100).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.periodSub}>7-day rolling</Text>
          </Card>
        </View>

        {/* Detailed Transactions List */}
        <View style={styles.txHeaderRow}>
          <Text style={styles.sectionHeader}>Transaction History</Text>
          <Text style={styles.txCount}>{ledgerEntries.length} entries</Text>
        </View>

        {ledgerEntries.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No Transactions Yet"
            description="Your payouts and service earnings will appear here once jobs are completed."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {ledgerEntries.map((item: any) => {
              const isCredit = item.type === 'CREDIT' || item.type === 'JOB_EARNING' || item.type === 'BONUS';
              return (
                <Card key={item.id} variant="default" style={styles.txCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.txIconWrap,
                        { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{isCredit ? '↓' : '↑'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.txTitle}>{item.title || item.description || item.type}</Text>
                      <Text style={styles.txSub}>{item.sub || item.booking?.code || new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.txAmount,
                          { color: isCredit ? '#15803D' : '#DC2626' },
                        ]}
                      >
                        {isCredit ? '+' : '-'}₹{((item.amountPaise || 0) / 100).toFixed(2)}
                      </Text>
                      <Text style={styles.txDate}>{item.date || new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  mainCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  mainLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  mainAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    marginVertical: 4,
  },
  bankTag: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 22,
    marginBottom: 10,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  periodCard: {
    flex: 1,
    padding: 14,
  },
  periodLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  periodValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  periodSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  txHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  txCard: {
    padding: 14,
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  txSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
