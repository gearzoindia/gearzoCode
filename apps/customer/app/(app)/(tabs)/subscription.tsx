import React, { useState } from 'react';
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
import { useSubscriptions, useVehicles } from '@gearzo/api-client';
import { Card, Badge, Button, LoadingScreen, ErrorScreen, EmptyState } from '@gearzo/ui';

type SubTab = 'ALL' | 'MY_PLANS';

export default function SubscriptionTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SubTab>('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');

  const { data: plans, isLoading, isError, refetch, isRefetching } = useSubscriptions();
  const { data: vehicles } = useVehicles();

  const mockPlans = plans || [
    {
      id: 'sub-annual-pro',
      title: 'GearZo Care Pass Pro',
      tagline: 'Complete peace of mind for daily drivers',
      pricePaise: 299900,
      validityDays: 365,
      badge: 'Save ₹4,500/yr',
      benefits: [
        '3 Comprehensive Periodic Services / year',
        'Unlimited Roadside Assistance & Battery Jumpstarts',
        'Zero Labour Charge on Emergency Breakdowns',
        'Free 30-Point Monsoon & Winter Inspections',
        'Priority Mechanic Dispatch under 20 mins',
      ],
    },
    {
      id: 'sub-semi-annual',
      title: 'GearZo Essential Rider',
      tagline: 'Perfect for two-wheeler city commuters',
      pricePaise: 129900,
      validityDays: 180,
      badge: 'Popular',
      benefits: [
        '2 Periodic Maintenance Services',
        '2 Free Emergency Breakdown Calls',
        'Complimentary Chain Lube & Wash',
        '10% Flat Discount on OEM Spare Parts',
      ],
    },
  ];

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading GearZo subscription plans..." />;
  }

  if (isError) {
    return <ErrorScreen message="Failed to load subscription plans." onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GearZo Pass</Text>
        <Text style={styles.subtitle}>
          Save up to 40% on annual vehicle maintenance with zero surprise charges.
        </Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ALL' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ALL')}
          accessibilityRole="button"
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
            All Subscriptions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'MY_PLANS' && styles.tabButtonActive]}
          onPress={() => setActiveTab('MY_PLANS')}
          accessibilityRole="button"
        >
          <Text style={[styles.tabText, activeTab === 'MY_PLANS' && styles.tabTextActive]}>
            My Subscription (0)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle Filter Selector */}
      {vehicles && vehicles.length > 0 && (
        <View style={styles.vehicleFilterBar}>
          <Text style={styles.filterLabel}>Vehicle:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              style={[styles.chip, selectedVehicleId === 'all' && styles.chipActive]}
              onPress={() => setSelectedVehicleId('all')}
            >
              <Text style={[styles.chipText, selectedVehicleId === 'all' && styles.chipTextActive]}>
                All Vehicles
              </Text>
            </TouchableOpacity>
            {vehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.chip, selectedVehicleId === v.id && styles.chipActive]}
                onPress={() => setSelectedVehicleId(v.id)}
              >
                <Text style={[styles.chipText, selectedVehicleId === v.id && styles.chipTextActive]}>
                  {v.brand} {v.model}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1B5E20" />
        }
      >
        {activeTab === 'MY_PLANS' ? (
          <EmptyState
            title="No Active Subscriptions"
            description="You don't have an active maintenance pass yet. Choose a plan to unlock free services and emergency roadside coverage!"
            buttonTitle="Browse Plans"
            onAction={() => setActiveTab('ALL')}
          />
        ) : (
          <View style={{ gap: 16 }}>
            {mockPlans.map((plan) => (
              <Card key={plan.id} variant="elevated" style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planTagline}>{plan.tagline}</Text>
                  </View>
                  {plan.badge && <Badge label={plan.badge} variant="warning" />}
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>
                    ₹{(plan.pricePaise / 100).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.planDuration}>/ {plan.validityDays} Days</Text>
                </View>

                <View style={styles.divider} />

                {/* Benefits List */}
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {plan.benefits.map((b, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 14, color: '#1B5E20', marginRight: 8 }}>✓</Text>
                      <Text style={{ fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 }}>
                        {b}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Subscribe Button with Coming Soon ribbon */}
                <View style={{ position: 'relative' }}>
                  <Button
                    title="Subscribe Now"
                    variant="primary"
                    size="md"
                    onPress={() => router.push(`/subscription/${plan.id}`)}
                  />
                  <View style={styles.comingSoonRibbon}>
                    <Text style={styles.comingSoonText}>COMING SOON</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabButtonActive: {
    backgroundColor: '#1B5E20',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  vehicleFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#1B5E20',
  },
  planCard: {
    padding: 18,
    borderRadius: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  planTagline: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B5E20',
  },
  planDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  comingSoonRibbon: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
