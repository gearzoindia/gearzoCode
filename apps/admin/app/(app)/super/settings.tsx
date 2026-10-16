import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

export default function SystemSettingsScreen() {
  const router = useRouter();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxDispatchAttempts, setMaxDispatchAttempts] = useState('5');
  const [dispatchTimeoutSecs, setDispatchTimeoutSecs] = useState('30');
  const [customerOtpTries, setCustomerOtpTries] = useState('5');

  const handleSave = () => {
    Alert.alert('Configuration Saved', 'System configurations updated.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Global Platform Configuration</Text>
          <Text style={styles.sub}>Master timeouts, dispatch loops, rate limits & emergency kill switches</Text>
        </View>

        <Button title="Save Configuration ✓" variant="primary" size="sm" onPress={handleSave} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Maintenance Switch */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.cardTitle}>Emergency Platform Maintenance Mode</Text>
              <Text style={styles.cardSub}>
                When activated, rejects new booking creation and displays scheduled maintenance screen.
              </Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ true: '#DC2626', false: '#CBD5E1' }}
            />
          </View>
        </Card>

        {/* Algorithm Settings */}
        <Text style={styles.sectionHeader}>Dispatch Algorithm Tuning</Text>
        <Card variant="default" style={styles.card}>
          <Input
            label="Mechanic Ring Timeout (Seconds before re-offering to next)"
            value={dispatchTimeoutSecs}
            onChangeText={setDispatchTimeoutSecs}
            keyboardType="number-pad"
          />

          <Input
            label="Maximum Search Dispatch Attempts before fallback"
            value={maxDispatchAttempts}
            onChangeText={setMaxDispatchAttempts}
            keyboardType="number-pad"
          />

          <Input
            label="Maximum OTP Resend Attempts (Rate Limit Protection)"
            value={customerOtpTries}
            onChangeText={setCustomerOtpTries}
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
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  switchRow: {
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
});
