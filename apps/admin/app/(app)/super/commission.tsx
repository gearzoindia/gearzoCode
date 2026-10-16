import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

export default function CommissionTiersScreen() {
  const router = useRouter();

  const [tiers, setTiers] = useState([
    { id: '1', tier: 'Standard Tier (0 - 50 jobs/mo)', cut: '12%' },
    { id: '2', tier: 'Silver Partner (51 - 100 jobs/mo)', cut: '10%' },
    { id: '3', tier: 'Gold Partner (100+ jobs/mo)', cut: '8%' },
    { id: '4', tier: 'Garage Workshop Fleet', cut: '9%' },
  ]);

  const handleSave = () => {
    Alert.alert('Saved', 'Commission tiers updated across settlement billing engine.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Platform Commission Tiers</Text>
          <Text style={styles.sub}>Configure take-rates, volume incentives & garage fleet margins</Text>
        </View>

        <Button title="Save Rates ✓" variant="primary" size="sm" onPress={handleSave} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardHeader}>Active Commission Schedule</Text>
          <View style={{ gap: 14, marginTop: 10 }}>
            {tiers.map((t) => (
              <View key={t.id} style={styles.tierRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierName}>{t.tier}</Text>
                  <Text style={styles.tierSub}>Auto applied based on monthly job volume</Text>
                </View>
                <View style={styles.cutBadge}>
                  <Text style={styles.cutText}>{t.cut}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
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
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tierName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tierSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cutBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
});
