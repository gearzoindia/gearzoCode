import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookings } from '@gearzo/api-client';
import { BookingCard, EmptyState, LoadingScreen, ErrorScreen } from '@gearzo/ui';
import type { Booking } from '@gearzo/schemas';

type TabStatus = 'ALL' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export default function BookingsTab() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabStatus>('ALL');

  const { data: bookings, isLoading, isError, refetch, isRefetching } = useBookings(
    selectedTab === 'ALL' ? undefined : selectedTab
  );

  const filteredBookings = (bookings || []).filter((booking) => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'ONGOING') {
      return ['SEARCHING', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(
        booking.status
      );
    }
    if (selectedTab === 'COMPLETED') return booking.status === 'COMPLETED';
    if (selectedTab === 'CANCELLED') return booking.status === 'CANCELLED';
    return true;
  });

  const handleBookingPress = (booking: Booking) => {
    if (booking.status === 'SEARCHING') {
      router.push(`/booking/${booking.id}/searching`);
    } else if (['ASSIGNED', 'ON_THE_WAY', 'ARRIVED'].includes(booking.status)) {
      router.push(`/booking/${booking.id}/track`);
    } else if (booking.status === 'IN_PROGRESS') {
      router.push(`/booking/${booking.id}/progress`);
    } else {
      router.push(`/booking/${booking.id}/invoice`);
    }
  };

  const tabs: { key: TabStatus; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'ONGOING', label: 'Ongoing' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading your bookings..." />;
  }

  if (isError) {
    return <ErrorScreen message="Failed to load bookings" onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isSelected && styles.tabItemActive]}
              onPress={() => setSelectedTab(tab.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredBookings.length === 0 && { flex: 1, justifyContent: 'center' },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1B5E20" />
        }
        renderItem={({ item }) => (
          <BookingCard
            id={item.id}
            serviceName={item.serviceName}
            vehicleSummary={item.vehicleSummary}
            scheduledAt={item.scheduledAt}
            status={item.status}
            totalAmountPaise={item.totalAmountPaise}
            onPress={() => handleBookingPress(item)}
            actionTitle={
              ['SEARCHING', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED'].includes(item.status)
                ? 'Track Live'
                : item.status === 'IN_PROGRESS'
                ? 'View Progress'
                : 'View Invoice'
            }
            onAction={() => handleBookingPress(item)}
            style={{ marginBottom: 12 }}
          />
        )}
        ListEmptyStateComponent={
          <EmptyState
            title="No Orders Yet"
            description="You don't have any vehicle services in this category. Book your first doorstep service now!"
            buttonTitle="Book a Service"
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabItemActive: {
    backgroundColor: '#1B5E20',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
});
