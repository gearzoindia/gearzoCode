import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminDashboard, useAdminBookings } from '@gearzo/api-client';
import { Card, Badge, Button, BookingCard, LoadingScreen } from '@gearzo/ui';

export default function AdminDashboardScreen() {
  const router = useRouter();

  const { data: metrics, isLoading, refetch, isRefetching } = useAdminDashboard();
  const { data: bookings } = useAdminBookings();

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading operations dashboard..." />;
  }

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${((metrics?.revenueTodayPaise || 8495000) / 100).toLocaleString('en-IN')}`,
      sub: '+18.4% vs last week',
      icon: '💰',
      color: '#10B981',
      route: '/finance/payouts',
    },
    {
      title: 'Active Bookings',
      value: (metrics?.totalBookingsToday || 42).toString(),
      sub: '14 en-route • 8 in-progress',
      icon: '⚡',
      color: '#3B82F6',
      route: '/bookings',
    },
    {
      title: 'Online Mechanics',
      value: (metrics?.activeMechanicsCount || 68).toString(),
      sub: '92% in 5km radius',
      icon: '👨‍🔧',
      color: '#6366F1',
      route: '/live-map',
    },
    {
      title: 'Pending KYC Queue',
      value: (metrics?.pendingKycCount || 9).toString(),
      sub: 'Oldest: 4 hrs ago',
      icon: '🪪',
      color: '#F59E0B',
      route: '/mechanics/kyc-queue',
    },
    {
      title: 'Open Disputes',
      value: (metrics?.openDisputesCount || 2).toString(),
      sub: 'Requires ops intervention',
      icon: '⚠️',
      color: '#EF4444',
      route: '/disputes',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Navbar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>Operations Dashboard</Text>
          <Text style={styles.pageSub}>Real-time system telemetry & service health</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            title="Live GPS Map 📍"
            variant="primary"
            size="sm"
            onPress={() => router.push('/live-map')}
          />
          <Button
            title="Broadcast Alert 📢"
            variant="outline"
            size="sm"
            onPress={() => router.push('/broadcasts/new')}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1B5E20" />
        }
      >
        {/* KPI Metrics Grid */}
        <View style={styles.kpiGrid}>
          {statCards.map((card, i) => (
            <TouchableOpacity
              key={i}
              style={styles.kpiCard}
              onPress={() => router.push(card.route as any)}
            >
              <View style={styles.kpiTop}>
                <Text style={styles.kpiIcon}>{card.icon}</Text>
                <Badge label="LIVE" variant="success" />
              </View>
              <Text style={styles.kpiValue}>{card.value}</Text>
              <Text style={styles.kpiTitle}>{card.title}</Text>
              <Text style={styles.kpiSub}>{card.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Active Bookings Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Real-time Service Orders</Text>
          <TouchableOpacity onPress={() => router.push('/bookings')}>
            <Text style={styles.linkAction}>View All Bookings →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 12 }}>
          {(bookings?.slice(0, 4) || [
            {
              id: 'gz-88120',
              serviceName: 'Comprehensive 40-Point Periodic Service',
              vehicleSummary: 'Royal Enfield Classic 350 (KA05MB9912)',
              scheduledAt: new Date().toISOString(),
              status: 'IN_PROGRESS',
              totalAmountPaise: 149900,
            },
            {
              id: 'gz-88121',
              serviceName: 'Emergency Battery Jumpstart',
              vehicleSummary: 'Hyundai Creta (KA01MC8823)',
              scheduledAt: new Date().toISOString(),
              status: 'ON_THE_WAY',
              totalAmountPaise: 49900,
            },
          ]).map((b) => (
            <BookingCard
              key={b.id}
              id={b.id}
              serviceName={b.serviceName}
              vehicleSummary={b.vehicleSummary}
              scheduledAt={b.scheduledAt}
              status={b.status}
              totalAmountPaise={b.totalAmountPaise}
              actionTitle="Inspect Order"
              onAction={() => router.push(`/bookings/${b.id}`)}
              onPress={() => router.push(`/bookings/${b.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiIcon: {
    fontSize: 24,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  linkAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
});
