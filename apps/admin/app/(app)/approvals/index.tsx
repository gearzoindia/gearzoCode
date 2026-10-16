import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  requester: string;
  amount?: string;
  reason: string;
}

export default function ApprovalsInboxScreen() {
  const router = useRouter();

  const [items, setItems] = useState<ApprovalItem[]>([
    {
      id: 'appr-1',
      type: 'LEDGER_ADJUSTMENT',
      title: 'Credit ₹500 to Ramesh Kumar (m-101)',
      requester: 'vikram.ops@gearzo.in',
      amount: '₹500.00',
      reason: 'Compensation for customer no-show after arrival.',
    },
    {
      id: 'appr-2',
      type: 'DISPUTE_REFUND',
      title: 'Full Order Refund on Order #GZ-88092',
      requester: 'priya.support@gearzo.in',
      amount: '₹1,499.00',
      reason: 'Quality audit verified improper brake tightening.',
    },
  ]);

  const handleApprove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    Alert.alert('Approved', 'Action authorized and applied.');
  };

  const handleReject = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    Alert.alert('Rejected', 'Request declined.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Maker-Checker Approvals</Text>
          <Text style={styles.sub}>Dual-authorization queue for financial changes and override actions</Text>
        </View>
        <Badge label={`${items.length} PENDING`} variant="warning" />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.topRow}>
              <Badge label={item.type} variant="info" />
              {item.amount && <Text style={styles.amount}>{item.amount}</Text>}
            </View>

            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.reason}>Justification: {item.reason}</Text>
            <Text style={styles.requester}>Requested by: {item.requester}</Text>

            <View style={styles.btnRow}>
              <Button
                title="Decline"
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => handleReject(item.id)}
              />
              <Button
                title="Authorize & Execute ✓"
                variant="primary"
                size="sm"
                style={{ flex: 2 }}
                onPress={() => handleApprove(item.id)}
              />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  requester: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
