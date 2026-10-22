import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, LoadingScreen, ErrorScreen } from '@gearzo/ui';
import { useServiceDetail } from '@gearzo/api-client';
import { useCartStore } from '../../../stores/cart-store';

export default function ServiceDetailScreen() {
  const { addItem } = useCartStore();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: service, isLoading, isError, refetch } = useServiceDetail(id || '');

  if (isLoading) {
    return <LoadingScreen message="Loading service information..." />;
  }

  if (isError || !service) {
    return <ErrorScreen message="Failed to load service details." onRetry={refetch} />;
  }

  const currentService = service;
  const features: string[] =
    (currentService as any).includedFeatures ||
    (currentService as any).inclusions || [
      'Engine & transmission multipoint diagnostic check',
      'Fluid level verification and top-up',
      'Brake pad wear & cable play calibration',
      'Electrical systems, battery & headlamp test',
      'Doorstep eco clean and tyre pressure check',
    ];

  const pricePaise = (currentService as any).pricePaise || currentService.basePricePaise || 0;

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
              ⏱ Takes ~{currentService.durationMinutes || 60} mins
            </Text>
          </View>
          <Text style={styles.title}>{currentService.name}</Text>
          <Text style={styles.description}>{currentService.description || 'Professional doorstep vehicle care.'}</Text>
        </View>

        {/* What's Included */}
        <Text style={styles.sectionHeader}>What's Included in this Package</Text>
        <Card variant="default" style={styles.checklistCard}>
          <View style={{ gap: 12 }}>
            {features.map((feature, idx) => (
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
            ₹{(pricePaise / 100).toLocaleString('en-IN')}
          </Text>
        </View>

        <Button
          title="Proceed to Book →"
          variant="primary"
          size="lg"
          style={{ paddingHorizontal: 24 }}
          onPress={() => {
            addItem({
              id: currentService.id,
              name: currentService.name,
              pricePaise: pricePaise,
              durationMinutes: currentService.durationMinutes,
              type: 'SERVICE',
            });
            router.push('/booking/checkout');
          }}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 6,
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
    alignItems: 'center',
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  guaranteeCard: {
    padding: 16,
    borderRadius: 12,
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8E9',
    gap: 8,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
  },
  guaranteeSub: {
    fontSize: 12,
    color: '#33691E',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
});
