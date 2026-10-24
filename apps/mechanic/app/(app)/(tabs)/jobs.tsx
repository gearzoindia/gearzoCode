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

  const realJobs: Booking[] = jobs || [];

  const filteredJobs = realJobs.filter((job) => {
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Tab Filter Pill Bar */}
      <View style={styles.filterBar}>
        {(['ONGOING', 'UPCOMING', 'COMPLETED'] as JobFilter[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterPill, selectedFilter === tab && styles.filterPillActive]}
            onPress={() => setSelectedFilter(tab)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === tab && styles.filterPillTextActive,
              ]}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingScreen message="Loading assigned jobs..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon="📋"
          title={`No ${selectedFilter.toLowerCase()} jobs`}
          description={
            selectedFilter === 'ONGOING'
              ? 'You do not have any active or dispatched jobs at the moment.'
              : `There are no ${selectedFilter.toLowerCase()} jobs on your record.`
          }
          actionTitle="Refresh List"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#1B5E20"
            />
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
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: '#1B5E20',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
});
