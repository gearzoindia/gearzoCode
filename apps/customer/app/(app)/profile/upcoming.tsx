import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookings } from '@gearzo/api-client';
import { BookingCard, EmptyState, LoadingScreen } from '@gearzo/ui';

export default function UpcomingServicesScreen() {
  const router = useRouter();
  const { data: bookings, isLoading } = useBookings();

  const upcoming = (bookings || []).filter((b) =>
    ['SEARCHING', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
  );

  if (isLoading) {
    return <LoadingScreen message="Loading upcoming bookings..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Services</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={upcoming}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, upcoming.length === 0 && { flex: 1, justifyContent: 'center' }]}
        renderItem={({ item }) => (
          <BookingCard
            id={item.id}
            serviceName={item.serviceName}
            vehicleSummary={item.vehicleSummary}
            scheduledAt={item.scheduledAt}
            status={item.status}
            totalAmountPaise={item.totalAmountPaise}
            actionTitle="Track Service"
            onAction={() => router.push(`/booking/${item.id}/track`)}
            onPress={() => router.push(`/booking/${item.id}/track`)}
            style={{ marginBottom: 12 }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Upcoming Appointments"
            description="You don't have any ongoing or scheduled services right now."
            buttonTitle="Schedule a Service"
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
