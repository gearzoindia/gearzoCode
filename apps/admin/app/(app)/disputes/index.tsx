import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminDisputes } from '@gearzo/api-client';
import { Card, Badge, EmptyState, LoadingScreen } from '@gearzo/ui';

export default function AdminDisputesIndex() {
  const router = useRouter();
  const { data: disputes, isLoading, refetch, isRefetching } = useAdminDisputes();

  const mockDisputes = disputes || [
    {
      id: 'disp-101',
      bookingId: 'GZ-88092',
      customerName: 'Kavita Nair',
      mechanicName: 'Ramesh Kumar',
      reason: 'Mechanic left oil stains on driveway and did not tighten rear drum brake cable.',
      status: 'OPEN' as const,
      amountPaise: 149900,
      createdAt: '2026-10-12T10:00:00Z',
    },
    {
      id: 'disp-102',
      bookingId: 'GZ-87980',
      customerName: 'Rahul Mehra',
      mechanicName: 'Suresh Mani',
      reason: 'Extra battery clamp was billed twice on doorstep invoice.',
      status: 'OPEN' as const,
      amountPaise: 45000,
      createdAt: '2026-10-11T14:30:00Z',
    },
  ];

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading disputes inbox..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Disputes & Escalations</Text>
          <Text style={styles.sub}>Customer complaints, quality audits & chargebacks</Text>
        </View>
        <Badge label={`${mockDisputes.length} OPEN`} variant="error" />
      </View>

      <FlatList
        data={mockDisputes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/disputes/${item.id}`)}
              style={styles.content}
            >
              <View style={styles.topRow}>
                <Text style={styles.bookingRef}>Order #{item.bookingId}</Text>
                <Badge
                  label={item.status}
                  variant={item.status === 'OPEN' ? 'error' : 'success'}
                />
              </View>

              <Text style={styles.parties}>
                {item.customerName} (Customer) ↔ {item.mechanicName} (Mechanic)
              </Text>
              <Text style={styles.reason} numberOfLines={2}>
                "{item.reason}"
              </Text>

              <View style={styles.footerRow}>
                <Text style={styles.amount}>
                  Claim: ₹{(item.amountPaise / 100).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.resolveLink}>Investigate Thread →</Text>
              </View>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Zero Open Disputes! 🎉"
            description="All quality complaints and customer service disputes have been resolved."
            buttonTitle="Refresh Inbox"
            onAction={refetch}
          />
        }
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
  content: {},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingRef: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  parties: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  resolveLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
});
