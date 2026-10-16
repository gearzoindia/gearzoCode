import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

export default function RewardsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GearZo Rewards & Coins</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Balance Card */}
        <Card variant="elevated" style={styles.balanceCard}>
          <Badge label="COMING SOON" variant="warning" />
          <Text style={styles.pointsBalance}>250 Coins</Text>
          <Text style={styles.pointsSub}>Worth ₹250 on next service checkout</Text>
          <Text style={styles.pointsNote}>
            Earn 10 GearZo coins for every ₹100 spent on maintenance, repairs and parts.
          </Text>
        </Card>

        {/* Coupons */}
        <Text style={styles.sectionTitle}>Available Coupons</Text>
        <Card variant="default" style={styles.couponCard}>
          <View style={styles.couponHeader}>
            <Text style={styles.couponCode}>GEARZO100</Text>
            <Badge label="ACTIVE" variant="success" />
          </View>
          <Text style={styles.couponDesc}>Flat ₹100 discount on your first periodic service booking.</Text>
          <Text style={styles.couponValid}>Valid till 31 Dec 2026</Text>
        </Card>

        <Button
          title="Back to Home"
          variant="outline"
          size="md"
          onPress={() => router.replace('/(app)/(tabs)')}
          style={{ marginTop: 24 }}
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
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#0D3811',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pointsBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  pointsSub: {
    fontSize: 14,
    color: '#A5D6A7',
    fontWeight: '600',
    marginTop: 2,
  },
  pointsNote: {
    fontSize: 12,
    color: '#E8F5E9',
    marginTop: 8,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  couponCard: {
    padding: 16,
    borderRadius: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
    letterSpacing: 1,
  },
  couponDesc: {
    fontSize: 13,
    color: '#374151',
  },
  couponValid: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
});
