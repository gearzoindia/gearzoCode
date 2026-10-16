import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge } from '@gearzo/ui';

export default function PayoutRunDetailScreen() {
  const router = useRouter();
  const { runId } = useLocalSearchParams<{ runId: string }>();

  const items = [
    {
      mechanicId: 'm-101',
      name: 'Ramesh Kumar',
      bankRef: 'HDFC A/C ***1234',
      utr: 'HDFCN26101299881',
      amountPaise: 245000,
      status: 'SUCCESS',
    },
    {
      mechanicId: 'm-102',
      name: 'Santosh S. (Shiva Garage)',
      bankRef: 'ICICI A/C ***8891',
      utr: 'ICICN26101299882',
      amountPaise: 412000,
      status: 'SUCCESS',
    },
    {
      mechanicId: 'm-104',
      name: 'Prakash Rao',
      bankRef: 'SBI A/C ***5512',
      utr: 'SBINN26101299883',
      amountPaise: 185000,
      status: 'SUCCESS',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batch: {runId}</Text>
        <Badge label="SETTLED" variant="success" />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.mechanicId}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.bank}>{item.bankRef} • UTR: {item.utr}</Text>
              </View>
              <Text style={styles.amount}>₹{(item.amountPaise / 100).toLocaleString('en-IN')}</Text>
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
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
  },
});
