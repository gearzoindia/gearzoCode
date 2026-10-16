import React, { useState } from 'react';
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
import { Card, Badge, Button } from '@gearzo/ui';
import { useMechanicEarnings } from '@gearzo/api-client';

interface LedgerItem {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  title: string;
  sub: string;
  amountPaise: number;
  date: string;
}

export default function MechanicEarningsTab() {
  const { data: earnings, refetch, isRefetching } = useMechanicEarnings();

  const [ledger] = useState<LedgerItem[]>([
    {
      id: 'tx-1',
      type: 'CREDIT',
      title: 'Service Payout: 40-Point Periodic Service',
      sub: 'Job #GZ-101 • Royal Enfield Classic 350',
      amountPaise: 119900,
      date: 'Today, 02:45 PM',
    },
    {
      id: 'tx-2',
      type: 'CREDIT',
      title: 'Extra Part Reimbursement: Clutch Cable',
      sub: 'Approved addition by customer',
      amountPaise: 38000,
      date: 'Today, 02:40 PM',
    },
    {
      id: 'tx-3',
      type: 'DEBIT',
      title: 'Platform Tech Commission (10%)',
      sub: 'Auto deducted on order completion',
      amountPaise: 11990,
      date: 'Today, 02:45 PM',
    },
    {
      id: 'tx-4',
      type: 'CREDIT',
      title: 'Doorstep Emergency Jumpstart',
      sub: 'Job #GZ-098 • Maruti Swift',
      amountPaise: 45000,
      date: 'Yesterday, 06:15 PM',
    },
    {
      id: 'tx-5',
      type: 'DEBIT',
      title: 'Bank IMPS Payout Sent',
      sub: 'Ref #IMPS98231 • HDFC Bank ***1234',
      amountPaise: 320000,
      date: '10 Oct, 11:30 AM',
    },
  ]);

  const handleWithdraw = () => {
    Alert.alert(
      'Withdrawal Request Initiated',
      '₹4,850.00 will be transferred to your registered HDFC bank account via instant IMPS.'
    );
  };

  const walletPaise = earnings?.walletBalancePaise || 485000;
  const todayPaise = earnings?.todayPaise || 165000;
  const thisWeekPaise = earnings?.thisWeekPaise || 984000;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings & Payout Ledger</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1B5E20" />
        }
      >
        {/* Main Wallet Card */}
        <Card variant="elevated" style={styles.mainCard}>
          <Text style={styles.mainLabel}>Available for Immediate Payout</Text>
          <Text style={styles.mainAmount}>
            ₹{(walletPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>

          <View style={styles.bankTag}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🏦</Text>
            <Text style={styles.bankTagText}>Linked: HDFC Bank A/C ending in 1234</Text>
          </View>

          <Button
            title="Transfer to Bank Now (IMPS)"
            variant="secondary"
            size="lg"
            style={{ backgroundColor: '#FFFFFF', marginTop: 16 }}
            textStyle={{ color: '#1B5E20', fontWeight: '800' }}
            onPress={handleWithdraw}
          />
        </Card>

        {/* Periods Breakdown */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statVal}>₹{(todayPaise / 100).toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statVal}>₹{(thisWeekPaise / 100).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Transaction Ledger */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Card variant="default" style={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}>
          {ledger.map((item, idx) => {
            const isCredit = item.type === 'CREDIT';
            return (
              <View key={item.id}>
                <View style={styles.txRow}>
                  <View style={[styles.txIconWrap, isCredit ? styles.iconCredit : styles.iconDebit]}>
                    <Text style={{ fontSize: 18 }}>{isCredit ? '↓' : '↑'}</Text>
                  </View>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.txTitle}>{item.title}</Text>
                    <Text style={styles.txSub}>{item.sub}</Text>
                    <Text style={styles.txDate}>{item.date}</Text>
                  </View>

                  <Text style={[styles.txAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
                    {isCredit ? '+' : '-'}₹{(item.amountPaise / 100).toFixed(2)}
                  </Text>
                </View>
                {idx < ledger.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>
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
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  mainCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1B5E20',
    marginBottom: 16,
  },
  mainLabel: {
    fontSize: 13,
    color: '#C8E6C9',
    fontWeight: '500',
  },
  mainAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  bankTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  bankTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCredit: {
    backgroundColor: '#DCFCE7',
  },
  iconDebit: {
    backgroundColor: '#FEE2E2',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  txSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  txDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  amountCredit: {
    color: '#166534',
  },
  amountDebit: {
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 64,
  },
});
