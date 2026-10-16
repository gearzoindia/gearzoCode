import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices } from '@gearzo/api-client';
import { ServiceCard, LoadingScreen, ErrorScreen, EmptyState } from '@gearzo/ui';

const CATEGORIES = [
  { id: 'all', name: 'All Services' },
  { id: 'general-service', name: 'Periodic Service' },
  { id: 'brakes', name: 'Brakes & Clutch' },
  { id: 'engine', name: 'Engine & Oil' },
  { id: 'electrical', name: 'Battery & Lights' },
  { id: 'tyres', name: 'Tyres & Wheels' },
];

export default function ServicesListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; vehicleType?: string }>();

  const [selectedCategory, setSelectedCategory] = useState<string>(params.categoryId || 'all');
  const [vehicleType, setVehicleType] = useState<string>(params.vehicleType || 'TWO_WHEELER');

  const { data: services, isLoading, isError, refetch, isRefetching } = useServices(
    selectedCategory === 'all' ? undefined : selectedCategory,
    vehicleType
  );

  const fallbackServices = [
    {
      id: 'srv-std-2w',
      name: 'Standard Periodic Service (2-Wheeler)',
      durationMinutes: 60,
      basePricePaise: 99900,
      description: 'Engine oil replacement, oil filter clean, spark plug check, brake tuning, full wash & lube.',
    },
    {
      id: 'srv-comp-2w',
      name: 'Comprehensive 40-Point Service',
      durationMinutes: 90,
      basePricePaise: 149900,
      description: 'Complete health check, throttle body cleaning, chain slack adjustment, wheel bearing check.',
    },
    {
      id: 'srv-brake-overhaul',
      name: 'Front & Rear Brake Overhaul',
      durationMinutes: 45,
      basePricePaise: 64900,
      description: 'Pads inspection, disc cleaning, brake cable lubricated and lever free-play adjusted.',
    },
    {
      id: 'srv-emergency-jump',
      name: 'Emergency Battery Jumpstart & Diagnostic',
      durationMinutes: 30,
      basePricePaise: 49900,
      description: 'Doorstep technician jumpstart, alternator voltage test, battery terminal cleaning.',
    },
  ];

  const displayServices = services && services.length > 0 ? services : fallbackServices;

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading available services..." />;
  }

  if (isError) {
    return <ErrorScreen message="Failed to load service catalogue" onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services Catalogue</Text>
        <TouchableOpacity onPress={() => router.push('/search')} style={styles.backBtn}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle Type Switcher */}
      <View style={styles.vehicleTypeRow}>
        <TouchableOpacity
          style={[styles.typeButton, vehicleType === 'TWO_WHEELER' && styles.typeButtonActive]}
          onPress={() => setVehicleType('TWO_WHEELER')}
        >
          <Text style={[styles.typeButtonText, vehicleType === 'TWO_WHEELER' && styles.typeButtonTextActive]}>
            🛵 2-Wheelers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, vehicleType === 'FOUR_WHEELER' && styles.typeButtonActive]}
          onPress={() => setVehicleType('FOUR_WHEELER')}
        >
          <Text style={[styles.typeButtonText, vehicleType === 'FOUR_WHEELER' && styles.typeButtonTextActive]}>
            🚗 4-Wheelers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Chips Bar */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Service Cards List */}
      <FlatList
        data={displayServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1B5E20" />
        }
        renderItem={({ item }) => (
          <ServiceCard
            name={item.name}
            durationMinutes={item.durationMinutes}
            pricePaise={item.basePricePaise}
            description={item.description}
            onSelect={() =>
              router.push({
                pathname: '/booking/checkout',
                params: { serviceId: item.id },
              })
            }
            onPressDetails={() => router.push(`/services/${item.id}`)}
            style={{ marginBottom: 12 }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Services in this Category"
            description="Try selecting another category or vehicle type."
            buttonTitle="Reset Filters"
            onAction={() => setSelectedCategory('all')}
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
  vehicleTypeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#1B5E20',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  categoryBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  catChipTextActive: {
    color: '#1B5E20',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
});
