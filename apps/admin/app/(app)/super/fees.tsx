import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

export default function FeesAndTaxesScreen() {
  const router = useRouter();

  const [platformFeePaise, setPlatformFeePaise] = useState('4900');
  const [gstPercent, setGstPercent] = useState('18');
  const [cancellationFeePaise, setCancellationFeePaise] = useState('9900');

  const handleSave = () => {
    Alert.alert('Saved', 'Tax and fee configurations updated.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Taxes & Platform Fees</Text>
          <Text style={styles.sub}>Configure GST calculation rules, platform convenience fees & cancellation charges</Text>
        </View>

        <Button title="Save Settings ✓" variant="primary" size="sm" onPress={handleSave} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardHeader}>Government GST Tax Rates</Text>
          <Input
            label="GST Rate on Automobile Labour & Services (%)"
            value={gstPercent}
            onChangeText={setGstPercent}
            keyboardType="number-pad"
          />

          <View style={styles.divider} />

          <Text style={styles.cardHeader}>Platform Safety & Convenience Fees</Text>
          <Input
            label="Doorstep Platform Fee in Paise (e.g. 4900 = ₹49.00)"
            value={platformFeePaise}
            onChangeText={setPlatformFeePaise}
            keyboardType="number-pad"
          />

          <Input
            label="Late Cancellation Fee in Paise (e.g. 9900 = ₹99.00)"
            value={cancellationFeePaise}
            onChangeText={setCancellationFeePaise}
            keyboardType="number-pad"
          />
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
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
});
