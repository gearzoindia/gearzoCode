import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubscriptions, useVehicles } from '@gearzo/api-client';
import { LoadingScreen } from '@gearzo/ui';

type SubTab = 'ALL' | 'MY_SUB';

export default function SubscriptionTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SubTab>('ALL');
  const { data: serverPlans, isLoading, refetch, isRefetching } = useSubscriptions();
  const { data: vehicles } = useVehicles();

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const primaryVehicle = vehicleList.find((v) => v.isDefault) || vehicleList[0] || null;

  const plans = (Array.isArray(serverPlans) ? serverPlans : []).map((p, idx) => ({
    id: p.id,
    vehicleType: (p as any).vehicleType === 'FOUR_WHEELER' ? '4-Wheeler' : '2-Wheeler',
    title: p.title || (p as any).name || 'Care Plan',
    badge: p.badge || (p as any).badge || 'Annual Care',
    validity: p.validityDays ? `${Math.round(p.validityDays / 30)} Months` : '1 Year',
    benefit: p.tagline || (p as any).description || (Array.isArray(p.benefits) ? p.benefits[0] : 'Free periodic checkups & priority technician dispatch'),
    price: `₹${Math.round(p.pricePaise / 100)}`,
    period: '/year',
    bgColor: idx % 2 === 0 ? '#0B4A27' : '#1E293B',
  }));

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading subscription plans..." />;
  }

  return (
    <View style={styles.container}>
      {/* Top Dark Green Curved Header */}
      <View style={styles.curvedHeader}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <Text style={styles.headerTitle}>Subscription Plans</Text>

          {/* Vehicle Dropdown Pill */}
          <TouchableOpacity
            style={styles.vehicleDropdownPill}
            onPress={() => Alert.alert('Select Vehicle', 'Filtering plans for all vehicles.')}
          >
            <Text style={{ fontSize: 13, marginRight: 6 }}>🚗</Text>
            <Text style={styles.vehicleDropdownText}>All Vehicles</Text>
            <Text style={styles.dropdownCaret}>▼</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Segmented Control: All Subscription vs My Subscription */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'ALL' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.segmentText, activeTab === 'ALL' && styles.segmentTextActive]}>
            All Subscription
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'MY_SUB' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('MY_SUB')}
        >
          <Text style={[styles.segmentText, activeTab === 'MY_SUB' && styles.segmentTextActive]}>
            My Subscription
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16A34A" />}
      >
        {activeTab === 'MY_SUB' ? (
          <View style={styles.emptyMySub}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🛡️</Text>
            <Text style={styles.emptyMySubTitle}>No Active Subscription</Text>
            <Text style={styles.emptyMySubDesc}>
              Protect your bike and save up to ₹3,000 every year with a GearZo Care Pass.
            </Text>
            <TouchableOpacity
              style={styles.browsePlansBtn}
              onPress={() => setActiveTab('ALL')}
            >
              <Text style={styles.browsePlansText}>Explore Plans</Text>
            </TouchableOpacity>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.emptyMySub}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🛡️</Text>
            <Text style={styles.emptyMySubTitle}>No Subscription Plans Available</Text>
            <Text style={styles.emptyMySubDesc}>
              There are no active plans in the catalogue right now. Please check back later.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {plans.map((p) => (
              <View key={p.id} style={styles.planCard}>
                {/* Dark Banner Top Half */}
                <View style={[styles.planCardHeader, { backgroundColor: p.bgColor }]}>
                  <View style={styles.planHeaderTopRow}>
                    <Text style={styles.vehicleTypeText}>🏍️ {p.vehicleType}</Text>
                    <View style={styles.validityBadge}>
                      <Text style={styles.validityLabel}>Validity</Text>
                      <Text style={styles.validityBold}>{p.validity}</Text>
                    </View>
                  </View>

                  <View style={styles.planHeroRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planTitle}>{p.title}</Text>
                      <View style={styles.benefitPill}>
                        <Text style={styles.benefitPillText}>{p.benefit}</Text>
                      </View>
                    </View>
                    <View style={styles.mechanicVisual}>
                      <Text style={{ fontSize: 44 }}>👨‍🔧</Text>
                    </View>
                  </View>
                </View>

                {/* Light Footer Row */}
                <View style={styles.planCardFooter}>
                  <View>
                    <Text style={styles.startingLabel}>Starting from</Text>
                    <Text style={styles.priceRow}>
                      <Text style={styles.priceAmount}>{p.price}</Text>
                      <Text style={styles.periodText}>{p.period}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() =>
                      Alert.alert(
                        p.title,
                        `Includes ${p.benefit}, priority roadside dispatch, and flat discounts on consumables. Proceed to purchase?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: `Subscribe for ${p.price}`,
                            onPress: () => router.push('/booking/checkout'),
                          },
                        ]
                      )
                    }
                  >
                    <Text style={styles.detailsBtnText}>View Plan Details →</Text>
                  </TouchableOpacity>
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
    marginBottom: 12,
  },
  vehicleDropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  vehicleDropdownText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownCaret: {
    color: '#A7F3D0',
    fontSize: 10,
    marginLeft: 6,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    padding: 3,
    marginHorizontal: 16,
    marginVertical: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#0F1F16',
  },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  planCardHeader: {
    padding: 16,
  },
  planHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleTypeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  validityBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
  },
  validityLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#6B7280',
  },
  validityBold: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F1F16',
  },
  planHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  benefitPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  benefitPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  mechanicVisual: {
    paddingLeft: 10,
  },
  planCardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startingLabel: {
    fontSize: 9.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F1F16',
  },
  periodText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailsBtn: {
    paddingVertical: 6,
  },
  detailsBtnText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyMySub: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyMySubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 6,
  },
  emptyMySubDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  browsePlansBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  browsePlansText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
  },
});
