import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminLiveMap } from '@gearzo/api-client';
import { Badge, Card } from '@gearzo/ui';

export default function AdminLiveMapScreen() {
  const router = useRouter();
  const { data: entities, isLoading, refetch } = useAdminLiveMap();

  const [filterType, setFilterType] = useState<'ALL' | 'MECHANIC' | 'CUSTOMER'>('ALL');

  const mockEntities = entities || [
    { id: 'm1', name: 'Ramesh K. (Online)', type: 'mechanic' as const, latitude: 12.9716, longitude: 77.5946, status: 'DUTY_ONLINE' },
    { id: 'm2', name: 'Suresh M. (En Route)', type: 'mechanic' as const, latitude: 12.9352, longitude: 77.6245, status: 'EN_ROUTE' },
    { id: 'c1', name: 'Anand V. (Job #GZ-88120)', type: 'customer' as const, latitude: 12.9698, longitude: 77.7499, status: 'WAITING_DISPATCH' },
    { id: 'c2', name: 'Priya R. (Job #GZ-88121)', type: 'customer' as const, latitude: 12.9279, longitude: 77.6835, status: 'IN_SERVICE' },
  ];

  const filtered = mockEntities.filter((e) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'MECHANIC') return e.type === 'mechanic';
    if (filterType === 'CUSTOMER') return e.type === 'customer';
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Live Fleet GPS Telemetry</Text>
          <Text style={styles.sub}>Real-time spatial tracking across active service zones</Text>
        </View>

        <View style={styles.filterGroup}>
          <TouchableOpacity
            style={[styles.filterBtn, filterType === 'ALL' && styles.filterBtnActive]}
            onPress={() => setFilterType('ALL')}
          >
            <Text style={[styles.filterText, filterType === 'ALL' && styles.filterTextActive]}>
              All ({mockEntities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filterType === 'MECHANIC' && styles.filterBtnActive]}
            onPress={() => setFilterType('MECHANIC')}
          >
            <Text style={[styles.filterText, filterType === 'MECHANIC' && styles.filterTextActive]}>
              Mechanics (Online)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filterType === 'CUSTOMER' && styles.filterBtnActive]}
            onPress={() => setFilterType('CUSTOMER')}
          >
            <Text style={[styles.filterText, filterType === 'CUSTOMER' && styles.filterTextActive]}>
              Active Bookings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Canvas */}
      <View style={styles.mapCanvas}>
        {/* Simulated Map Markers */}
        <View style={{ position: 'absolute', top: 80, left: 100, alignItems: 'center' }}>
          <View style={[styles.markerBadge, { backgroundColor: '#1B5E20' }]}>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>🛵 Ramesh K.</Text>
          </View>
          <Text style={{ fontSize: 24 }}>📍</Text>
        </View>

        <View style={{ position: 'absolute', top: 160, right: 120, alignItems: 'center' }}>
          <View style={[styles.markerBadge, { backgroundColor: '#0284C7' }]}>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>🏠 Anand V. (#88120)</Text>
          </View>
          <Text style={{ fontSize: 24 }}>📍</Text>
        </View>

        <View style={{ position: 'absolute', bottom: 120, left: 160, alignItems: 'center' }}>
          <View style={[styles.markerBadge, { backgroundColor: '#D97706' }]}>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>🛵 Suresh M. (En Route)</Text>
          </View>
          <Text style={{ fontSize: 24 }}>📍</Text>
        </View>

        {/* Legend Overlay Card */}
        <Card variant="elevated" style={styles.legendCard}>
          <Text style={styles.legendTitle}>Zone: Bengaluru Urban (PostGIS 4326)</Text>
          <View style={{ gap: 6, marginTop: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.legendDot, { backgroundColor: '#1B5E20' }]} />
              <Text style={styles.legendText}>Available Mechanics</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.legendText}>Mechanics On The Way</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.legendDot, { backgroundColor: '#0284C7' }]} />
              <Text style={styles.legendText}>Active Customer Doorstep Bookings</Text>
            </View>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
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
  filterGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#CBD5E1',
    position: 'relative',
  },
  markerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
    elevation: 3,
  },
  legendCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#334155',
  },
});
