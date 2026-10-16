import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminBookings } from '@gearzo/api-client';
import { BookingCard, EmptyState, LoadingScreen } from '@gearzo/ui';

export default function AdminBookingsIndex() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: bookings, isLoading, refetch, isRefetching } = useAdminBookings({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const mockBookings = bookings || [
    {
      id: 'GZ-88120',
      customerId: 'c1',
      serviceId: 's1',
      serviceName: 'Comprehensive 40-Point Periodic Service',
      servicePricePaise: 149900,
      vehicleId: 'v1',
      vehicleSummary: 'Royal Enfield Classic 350 (KA05MB9912)',
      status: 'IN_PROGRESS' as const,
      scheduledAt: new Date().toISOString(),
      address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru',
      latitude: 12.9698,
      longitude: 77.7499,
      totalAmountPaise: 149900,
      paidAmountPaise: 149900,
      balanceAmountPaise: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'GZ-88121',
      customerId: 'c2',
      serviceId: 's2',
      serviceName: 'Emergency Battery Jumpstart',
      servicePricePaise: 49900,
      vehicleId: 'v2',
      vehicleSummary: 'Hyundai Creta (KA01MC8823)',
      status: 'ON_THE_WAY' as const,
      scheduledAt: new Date().toISOString(),
      address: 'Prestige Tech Park, Marathahalli, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6835,
      totalAmountPaise: 49900,
      paidAmountPaise: 49900,
      balanceAmountPaise: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'GZ-88118',
      customerId: 'c3',
      serviceId: 's3',
      serviceName: 'Front & Rear Brake Pad Replacement',
      servicePricePaise: 79900,
      vehicleId: 'v3',
      vehicleSummary: 'Honda Activa 6G (KA03HA2201)',
      status: 'COMPLETED' as const,
      scheduledAt: new Date(Date.now() - 86400000).toISOString(),
      address: 'Indiranagar 100ft Rd, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      totalAmountPaise: 92500,
      paidAmountPaise: 92500,
      balanceAmountPaise: 0,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const filtered = mockBookings.filter((b) => {
    const matchesQuery =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicleSummary.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase());
    return matchesQuery;
  });

  const statuses = ['ALL', 'SEARCHING', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading bookings catalogue..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>All Bookings</Text>
          <Text style={styles.sub}>Search and inspect customer service dispatches</Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by GZ-code, vehicle or service..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statuses}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = statusFilter === item;
            return (
              <TouchableOpacity
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setStatusFilter(item)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
            actionTitle="View Timeline & Audit →"
            onAction={() => router.push(`/bookings/${item.id}`)}
            onPress={() => router.push(`/bookings/${item.id}`)}
            style={{ marginBottom: 12 }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Bookings Found"
            description="No service requests match your search criteria or status filter."
            buttonTitle="Reset Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('ALL');
            }}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
    minWidth: 280,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  filterBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
