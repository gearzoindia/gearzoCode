import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMechanicJobs } from '@gearzo/api-client';
import { BookingCard, EmptyState, LoadingScreen } from '@gearzo/ui';
import type { Booking } from '@gearzo/schemas';

type JobFilter = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export default function MechanicJobsTab() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<JobFilter>('ONGOING');

  const { data: jobs, isLoading, refetch, isRefetching } = useMechanicJobs();

  const mockJobs: Booking[] = jobs || [
    {
      id: 'gz-job-101',
      customerId: 'cust-1',
      serviceId: 'srv-std',
      serviceName: 'Comprehensive 40-Point Periodic Service',
      servicePricePaise: 149900,
      vehicleId: 'veh-1',
      vehicleSummary: 'Royal Enfield Classic 350 (KA05MB9912)',
      status: 'ON_THE_WAY',
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
      id: 'gz-job-102',
      customerId: 'cust-2',
      serviceId: 'srv-brake',
      serviceName: 'Front & Rear Brake Pad Replacement',
      servicePricePaise: 69900,
      vehicleId: 'veh-2',
      vehicleSummary: 'Maruti Suzuki Swift (KA01MC4401)',
      status: 'COMPLETED',
      scheduledAt: new Date(Date.now() - 86400000).toISOString(),
      address: '2nd Cross, Koramangala 4th Block, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      totalAmountPaise: 82500,
      paidAmountPaise: 82500,
      balanceAmountPaise: 0,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const filteredJobs = mockJobs.filter((job) => {
    if (selectedFilter === 'ONGOING') {
      return ['ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(job.status);
    }
    if (selectedFilter === 'UPCOMING') {
      return job.status === 'DRAFT' || job.status === 'SEARCHING';
    }
    if (selectedFilter === 'COMPLETED') {
      return job.status === 'COMPLETED' || job.status === 'CANCELLED';
    }
    return true;
  });

  const getActionTitle = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
      case 'ON_THE_WAY':
        return 'Navigate to Customer 📍';
      case 'ARRIVED':
        return 'Enter Start OTP 🔑';
      case 'IN_PROGRESS':
        return 'Work Checklist ⚙️';
      case 'COMPLETED':
      default:
        return 'View Summary 📄';
    }
  };

  const handleAction = (job: Booking) => {
    if (job.status === 'ASSIGNED' || job.status === 'ON_THE_WAY') {
      router.push(`/job/${job.id}/navigate`);
    } else if (job.status === 'ARRIVED') {
      router.push(`/job/${job.id}/start`);
    } else if (job.status === 'IN_PROGRESS') {
      router.push(`/job/${job.id}/work`);
    } else {
      router.push(`/job/${job.id}`);
    }
  };

  const filters: { key: JobFilter; label: string }[] = [
    { key: 'ONGOING', label: 'Active & In Progress' },
    { key: 'UPCOMING', label: 'Scheduled' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading partner jobs..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Partner Job Queue</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => {
          const isSelected = selectedFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedFilter(f.key)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, filteredJobs.length === 0 && { flex: 1, justifyContent: 'center' }]}
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
            actionTitle={getActionTitle(item.status)}
            onAction={() => handleAction(item)}
            onPress={() => router.push(`/job/${item.id}`)}
            style={{ marginBottom: 12 }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Jobs in this Category"
            description="Keep your duty status Online to receive instant job dispatch offers."
            buttonTitle="Refresh Jobs"
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#1B5E20',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
});
