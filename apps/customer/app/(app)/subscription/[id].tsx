import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

export default function SubscriptionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const plan = {
    id: id || 'sub-annual-pro',
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
      '10% Flat Discount on OEM Spare Parts',
    ],
  };

  const handleSubscribe = () => {
    Alert.alert(
      'Coming Soon',
      'The GearZo Care Pass is launching soon in your city! We will notify you once active.'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Card variant="elevated" style={styles.card}>
          <Badge label={plan.badge} variant="warning" />
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.tagline}>{plan.tagline}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₹{(plan.pricePaise / 100).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.duration}>/ {plan.validityDays} Days Validity</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Included Privileges</Text>
          <View style={{ gap: 10 }}>
            {plan.benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Button
          title="Join Waitlist (Coming Soon)"
          variant="primary"
          size="lg"
          style={{ marginTop: 24 }}
          onPress={handleSubscribe}
        />
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
  card: {
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    marginBottom: 16,
  },
  price: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1B5E20',
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  check: {
    fontSize: 15,
    color: '#1B5E20',
    fontWeight: '800',
    marginRight: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
});
