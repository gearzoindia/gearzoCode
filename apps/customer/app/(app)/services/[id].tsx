import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServiceDetail } from '@gearzo/api-client';
import { Card, Badge, Button, LoadingScreen, ErrorScreen } from '@gearzo/ui';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: service, isLoading, isError, refetch } = useServiceDetail(id || '');

  const fallbackService = {
    id: id || 'srv-default',
    name: 'Standard Periodic Service',
    description:
      'Engineered to restore peak motorcycle performance. Includes top-tier synthetic blend engine oil, filter maintenance, spark plug cleansing, and brake calibration.',
    durationMinutes: 75,
    basePricePaise: 119900,
    includedFeatures: [
      'Engine oil replacement (Up to 1.2L OEM grade)',
      'Oil filter clean / replacement',
      'Air filter cleaning & inspection',
      'Spark plug cleaning and electrode gap setting',
      'Front & rear brake pad cleaning & inspection',
      'Drive chain cleaning, tightening & lubrication',
      'Clutch & accelerator cable play adjustment',
      'Full electrical battery, horn, headlamp check',
      'Doorstep eco wash and tyre pressure check',
    ],
  };

  const currentService = service || fallbackService;

  if (isLoading) {
    return <LoadingScreen message="Loading service information..." />;
  }

  if (isError) {
    return <ErrorScreen message="Failed to load service" onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Service Details
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Title & Duration */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Badge label="GEARZO CERTIFIED" variant="success" />
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              ⏱ Takes ~{currentService.durationMinutes} mins
            </Text>
          </View>
          <Text style={styles.title}>{currentService.name}</Text>
          <Text style={styles.description}>{currentService.description}</Text>
        </View>

        {/* What's Included */}
        <Text style={styles.sectionHeader}>What's Included in this Package</Text>
        <Card variant="default" style={styles.checklistCard}>
          <View style={{ gap: 12 }}>
            {currentService.includedFeatures?.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={styles.checkIcon}>
                  <Text style={{ color: '#1B5E20', fontWeight: '800', fontSize: 12 }}>✓</Text>
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* GearZo Assurance */}
        <Text style={styles.sectionHeader}>GearZo Guarantee</Text>
        <Card variant="outlined" style={styles.guaranteeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>🛡️</Text>
            <View>
              <Text style={styles.guaranteeTitle}>30 Days / 1,000 km Warranty</Text>
              <Text style={styles.guaranteeSub}>
                Free resolution in case of any post-service issues
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>🏷️</Text>
            <View>
              <Text style={styles.guaranteeTitle}>Genuine Spare Parts Only</Text>
              <Text style={styles.guaranteeSub}>OES / OEM certified components with sealed MRP bills</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPrice}>
            ₹{(currentService.basePricePaise / 100).toLocaleString('en-IN')}
          </Text>
        </View>

        <Button
          title="Proceed to Book →"
          variant="primary"
          size="lg"
          style={{ paddingHorizontal: 24 }}
          onPress={() =>
            router.push({
              pathname: '/booking/checkout',
              params: { serviceId: currentService.id },
            })
          }
        />
      </View>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },
  checklistCard: {
    padding: 16,
    borderRadius: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  guaranteeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  guaranteeSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
  },
});
