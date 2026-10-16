import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

export default function MechanicJobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const job = {
    id: id || 'gz-job-101',
    customerName: 'Anand Verma',
    customerPhone: '+919876543210',
    serviceName: 'Comprehensive 40-Point Periodic Service',
    vehicleSummary: 'Royal Enfield Classic 350 (KA05MB9912)',
    status: 'ON_THE_WAY',
    address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru',
    totalAmountPaise: 149900,
    payoutPaise: 119900,
    scheduledAt: new Date().toISOString(),
  };

  const handleCall = () => {
    Linking.openURL(`tel:${job.customerPhone}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job #{job.id.slice(0, 8).toUpperCase()}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Card variant="elevated" style={styles.statusCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={styles.statusValue}>{job.status.replace('_', ' ')}</Text>
            </View>
            <Badge label={job.status} variant="info" />
          </View>
        </Card>

        {/* Customer Information */}
        <Text style={styles.sectionHeader}>Customer Details</Text>
        <Card variant="default" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.customerName}>{job.customerName}</Text>
              <Text style={styles.customerPhone}>{job.customerPhone}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <Text style={styles.label}>Service Address:</Text>
          <Text style={styles.addressText}>{job.address}</Text>
        </Card>

        {/* Vehicle Details */}
        <Text style={styles.sectionHeader}>Vehicle</Text>
        <Card variant="default" style={styles.card}>
          <Text style={styles.vehicleTitle}>{job.vehicleSummary}</Text>
          <Text style={styles.serviceName}>{job.serviceName}</Text>
        </Card>

        {/* Actions based on status */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <Button
            title="Navigate to Location 🗺️"
            variant="primary"
            size="lg"
            onPress={() => router.push(`/job/${job.id}/navigate`)}
          />
          <Button
            title="Arrived at Location → Enter Start OTP 🔑"
            variant="secondary"
            size="md"
            onPress={() => router.push(`/job/${job.id}/start`)}
          />
        </View>
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
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  customerPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
    lineHeight: 18,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  serviceName: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
  },
});
