import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

export default function PricingSurgeScreen() {
  const router = useRouter();

  const [surgeEnabled, setSurgeEnabled] = useState(true);
  const [maxSurge, setMaxSurge] = useState('1.5');
  const [emergencyBaseRate, setEmergencyBaseRate] = useState('499');

  const handleSave = () => {
    Alert.alert('Pricing Updated', 'Global rate rules and surge constraints updated.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dynamic Pricing & Surge Rules</Text>
          <Text style={styles.sub}>Configure peak hours demand algorithm, rate caps & minimum booking fares</Text>
        </View>

        <Button title="Save Changes ✓" variant="primary" size="sm" onPress={handleSave} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Dynamic Surge Algorithm Toggle */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.cardTitle}>Dynamic Surge Algorithm</Text>
              <Text style={styles.cardSub}>
                Automatically scale doorstep rates during severe monsoon weather or high booking traffic.
              </Text>
            </View>
            <Switch
              value={surgeEnabled}
              onValueChange={setSurgeEnabled}
              trackColor={{ true: '#1B5E20', false: '#CBD5E1' }}
            />
          </View>

          <View style={styles.divider} />

          <Input
            label="Maximum Allowed Surge Cap (e.g. 1.5 = 150% max)"
            value={maxSurge}
            onChangeText={setMaxSurge}
            keyboardType="numeric"
          />

          <Input
            label="Emergency Roadside Breakdown Base Rate (₹)"
            value={emergencyBaseRate}
            onChangeText={setEmergencyBaseRate}
            keyboardType="number-pad"
          />
        </Card>

        {/* Night Shift & Festival Surges */}
        <Text style={styles.sectionHeader}>Time-based Surcharges</Text>
        <Card variant="default" style={styles.card}>
          <View style={styles.itemRow}>
            <Text style={styles.itemTitle}>Late Night Dispatch (09:00 PM - 06:00 AM)</Text>
            <Text style={styles.itemValue}>+₹200 Flat</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemTitle}>Rain / Waterlogging Surcharge</Text>
            <Text style={styles.itemValue}>+1.25x Dynamic</Text>
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
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B5E20',
  },
});
