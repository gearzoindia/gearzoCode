import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useToggleDuty, useMechanicEarnings, useMechanicJobs } from '@gearzo/api-client';
import { Card, Badge, Button, BookingCard } from '@gearzo/ui';

export default function MechanicDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [isOnline, setIsOnline] = useState(true);

  const toggleDutyMutation = useToggleDuty();
  const { data: earnings, refetch: refetchEarnings, isRefetching } = useMechanicEarnings();
  const { data: jobs, refetch: refetchJobs } = useMechanicJobs();

  const activeJob = jobs?.find((j) =>
    ['ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(j.status)
  );

  const handleToggleDuty = async (val: boolean) => {
    setIsOnline(val);
    try {
      await toggleDutyMutation.mutateAsync(val);
    } catch {
      // Revert if error
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetchEarnings(), refetchJobs()]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar with Online/Offline Switch */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name || 'Partner'} 👨‍🔧</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.statusLabel}>
              {isOnline ? 'Online (Accepting Jobs)' : 'Offline (Paused)'}
            </Text>
          </View>
        </View>

        <View style={styles.switchBox}>
          <Switch
            value={isOnline}
            onValueChange={handleToggleDuty}
            trackColor={{ true: '#1B5E20', false: '#9CA3AF' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#1B5E20" />
        }
      >
        {/* Wallet Balance Card */}
        <Card variant="elevated" style={styles.walletCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.walletLabel}>Available Wallet Balance</Text>
              <Text style={styles.walletAmount}>
                ₹{((earnings?.walletBalancePaise || 0) / 100).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => router.push('/(app)/(tabs)/earnings')}
            >
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Today's Performance Metrics */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              ₹{((earnings?.todayPaise || 0) / 100).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{earnings?.completedJobsCount || 0}</Text>
            <Text style={styles.statLabel}>Completed Jobs</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.9 ⭐</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Active Job Card */}
        {activeJob ? (
          <View style={{ marginTop: 20 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Active Assigned Job</Text>
              <Badge label="IN PROGRESS" variant="warning" />
            </View>
            <BookingCard
              id={activeJob.id}
              serviceName={activeJob.serviceName}
              vehicleSummary={activeJob.vehicleSummary}
              scheduledAt={activeJob.scheduledAt}
              status={activeJob.status}
              totalAmountPaise={activeJob.totalAmountPaise}
              actionTitle="Open Job Console →"
              onAction={() => router.push(`/job/${activeJob.id}`)}
              onPress={() => router.push(`/job/${activeJob.id}`)}
            />
          </View>
        ) : (
          /* Simulated Test Offer Trigger when idle */
          <Card variant="outlined" style={styles.idleCard}>
            <View style={styles.radarIconWrap}>
              <Text style={{ fontSize: 28 }}>📡</Text>
            </View>
            <Text style={styles.idleTitle}>
              {isOnline ? 'Waiting for Nearby Dispatch Offers' : 'You are currently Offline'}
            </Text>
            <Text style={styles.idleSub}>
              {isOnline
                ? 'Stay within your service radius with GPS turned on. Jobs will ring automatically.'
                : 'Turn toggle on to start receiving customer service requests.'}
            </Text>

            
          </Card>
        )}

        {/* Weekly Hours & Leave Manager */}
        <Text style={styles.sectionTitle}>Working Hours & Schedule</Text>
        <Card variant="default" style={styles.scheduleCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleTitle}>Mon - Sat (08:30 AM - 07:00 PM)</Text>
              <Text style={styles.scheduleSub}>Operating 6 days a week • 5 km radius</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/availability')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOnline: {
    backgroundColor: '#1B5E20',
  },
  dotOffline: {
    backgroundColor: '#9CA3AF',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  switchBox: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  walletCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#0D3811',
    marginBottom: 20,
  },
  walletLabel: {
    fontSize: 12,
    color: '#A5D6A7',
    fontWeight: '600',
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  withdrawBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  withdrawBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  idleCard: {
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  radarIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  idleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  idleSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 12,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  scheduleSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  editLink: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: '700',
  },
});
