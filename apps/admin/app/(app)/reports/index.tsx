import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

export default function ReportsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Analytics & Operations Reports</Text>
          <Text style={styles.sub}>Platform GMV, fulfillment velocity & unit economics</Text>
        </View>

        <Button
          title="Export CSV Data 📥"
          variant="primary"
          size="sm"
          onPress={() => router.push('/reports/exports')}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* GMV Overview Card */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardLabel}>Month-to-Date Platform GMV</Text>
          <Text style={styles.cardVal}>₹24,85,900.00</Text>
          <Text style={styles.cardSub}>Platform Take Rate: 10.2% (₹2,53,561 net commission)</Text>
        </Card>

        {/* Operational Performance */}
        <Text style={styles.sectionHeader}>Fulfillment Quality Metrics</Text>
        <View style={styles.gridRow}>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statLabel}>Median Dispatch Time</Text>
            <Text style={styles.statVal}>3.2 mins</Text>
            <Text style={styles.statSub}>Target: &lt; 5 mins</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Mechanic Arrival ETA</Text>
            <Text style={styles.statVal}>22.4 mins</Text>
            <Text style={styles.statSub}>Target: &lt; 30 mins</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statLabel}>Customer CSAT</Text>
            <Text style={styles.statVal}>4.88 ⭐</Text>
            <Text style={styles.statSub}>94% 5-star ratings</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statLabel}>Warranty Claim Rate</Text>
            <Text style={styles.statVal}>1.1%</Text>
            <Text style={styles.statSub}>Target: &lt; 2.5%</Text>
          </Card>
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
  header: {
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
  card: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cardVal: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#34D399',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
});
