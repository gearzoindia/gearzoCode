import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookings } from '@gearzo/api-client';

type BookingTab = 'ALL' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'SUBSCRIPTION';

export default function BookingsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<BookingTab>('ALL');

  const { data: serverBookings, isLoading, refetch, isRefetching } = useBookings();

  const bookings = Array.isArray(serverBookings)
    ? serverBookings.map((b) => ({
        id: b.id,
        serviceName: (b as any).serviceName || 'Vehicle Service',
        vehicle: (b as any).vehicleSummary || 'Vehicle',
        slot: b.scheduledAt
          ? new Date(b.scheduledAt).toLocaleString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })
          : 'Scheduled',
        status: b.status === 'COMPLETED' ? 'Completed' : b.status === 'CANCELLED' ? 'Cancelled' : 'Ongoing',
        mechanicText:
          b.status === 'COMPLETED'
            ? 'Completed'
            : (b as any).mechanic?.name
            ? `${(b as any).mechanic.name} is assigned`
            : 'Finding mechanic...',
        price: `₹${Math.round((b.totalAmountPaise || 0) / 100)}`,
        icon: ((b as any).vehicleSummary || '').toLowerCase().includes('car') ? '🚗' : '🛵',
        type: b.status === 'COMPLETED' ? 'COMPLETED' : b.status === 'CANCELLED' ? 'CANCELLED' : 'ONGOING',
      }))
    : [];

  const filteredBookings = bookings.filter((b) => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'ONGOING') return b.type === 'ONGOING';
    if (selectedTab === 'COMPLETED') return b.type === 'COMPLETED';
    if (selectedTab === 'CANCELLED') return b.type === 'CANCELLED';
    if (selectedTab === 'SUBSCRIPTION') return false; // Triggers empty state Screen 23!
    return true;
  });

  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'ONGOING', label: 'Ongoing' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'SUBSCRIPTION', label: 'Subscription booking' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Dark Green Curved Header */}
      <View style={styles.curvedHeader}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </SafeAreaView>
      </View>

      {/* Filter Tabs Horizontal Scroll */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedTab(tab.key as BookingTab)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 110, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16A34A" />}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length === 0 ? (
          // Screen 23: Empty State
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't booked any service yet.{'\n'}Start with your first booking!
            </Text>
            <TouchableOpacity
              style={styles.bookFirstBtn}
              onPress={() => router.push('/services')}
            >
              <Text style={styles.bookFirstBtnText}>Book a Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Screen 22: Bookings List
          <View style={{ gap: 12 }}>
            {filteredBookings.map((item) => (
              <View key={item.id} style={styles.bookingCard}>
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.iconBox}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <Text style={styles.serviceName}>{item.serviceName}</Text>
                    <Text style={styles.vehicleSlot}>
                      {item.vehicle} · {item.slot}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'Ongoing'
                        ? styles.statusOngoing
                        : item.status === 'Completed'
                        ? styles.statusCompleted
                        : styles.statusCancelled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.status === 'Ongoing'
                          ? { color: '#D97706' }
                          : item.status === 'Completed'
                          ? { color: '#16A34A' }
                          : { color: '#DC2626' },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Mechanic / Rating / Price Row */}
                <View style={styles.mechanicPriceRow}>
                  <Text style={styles.mechanicText}>{item.mechanicText}</Text>
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {item.status === 'Ongoing' ? (
                    <>
                      <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={() => router.push(`/booking/${item.id}/track`)}
                      >
                        <Text style={styles.primaryActionText}>Track Mechanic</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.outlineActionBtn}
                        onPress={() => router.push('/profile/help')}
                      >
                        <Text style={styles.outlineActionText}>Help</Text>
                      </TouchableOpacity>
                    </>
                  ) : item.status === 'Completed' ? (
                    <>
                      <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={() => router.push('/services')}
                      >
                        <Text style={styles.primaryActionText}>Rebook</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.outlineActionBtn}
                        onPress={() => router.push(`/booking/${item.id}/invoice`)}
                      >
                        <Text style={styles.outlineActionText}>Invoice</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.rebookFullBtn}
                      onPress={() => router.push('/services')}
                    >
                      <Text style={styles.primaryActionText}>Book Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  curvedHeader: {
    backgroundColor: '#0B4A27',
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  tabsWrapper: {
    backgroundColor: '#FAFAF9',
    paddingVertical: 12,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#0B4A27',
    borderColor: '#0B4A27',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F1F16',
  },
  vehicleSlot: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusOngoing: {
    backgroundColor: '#FEF3C7',
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  mechanicPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mechanicText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  outlineActionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  outlineActionText: {
    color: '#0F1F16',
    fontSize: 12,
    fontWeight: '700',
  },
  rebookFullBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  bookFirstBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  bookFirstBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
