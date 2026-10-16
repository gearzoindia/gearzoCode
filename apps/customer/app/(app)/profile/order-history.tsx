import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookings } from '@gearzo/api-client';
import { BookingCard, EmptyState, LoadingScreen } from '@gearzo/ui';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { data: bookings, isLoading } = useBookings();

  const history = (bookings || []).filter((b) =>
    ['COMPLETED', 'CANCELLED'].includes(b.status)
  );

  if (isLoading) {
    return <LoadingScreen message="Loading order history..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, history.length === 0 && { flex: 1, justifyContent: 'center' }]}
        renderItem={({ item }) => (
          <BookingCard
            id={item.id}
            serviceName={item.serviceName}
            vehicleSummary={item.vehicleSummary}
            scheduledAt={item.scheduledAt}
            status={item.status}
            totalAmountPaise={item.totalAmountPaise}
            actionTitle="View Invoice"
            onAction={() => router.push(`/booking/${item.id}/invoice`)}
            onPress={() => router.push(`/booking/${item.id}/invoice`)}
            style={{ marginBottom: 12 }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Past Orders"
            description="Completed and cancelled orders will show up here."
            buttonTitle="Browse Services"
            onAction={() => router.push('/services')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContainer: {
    padding: 16,
  },
});
