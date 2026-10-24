import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useMechanicJobDetail } from '@gearzo/api-client';

export default function MechanicJobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: job, isLoading } = useMechanicJobDetail(id || '');

  if (isLoading) {
    return <LoadingScreen message="Loading Job Details..." />;
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <EmptyState
          icon="📋"
          title="Job Not Found"
          description="The requested job order could not be retrieved or has expired."
          actionTitle="Back to Dashboard"
          onAction={() => router.replace('/(app)/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    const phone = (job as any).customer?.phone || (job as any).customerPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const customerName = (job as any).customer?.name || (job as any).customerName || 'Customer';
  const customerPhone = (job as any).customer?.phone || (job as any).customerPhone || 'Contact via app';

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
              <Text style={styles.statusValue}>{job.status.replace(/_/g, ' ')}</Text>
            </View>
            <Badge label={job.status} variant="info" />
          </View>
        </Card>

        {/* Customer Information */}
        <Text style={styles.sectionHeader}>Customer Details</Text>
        <Card variant="default" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerPhone}>{customerPhone}</Text>
            </View>
            {customerPhone && (
              <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Text style={{ fontSize: 18 }}>📞</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
          <Text style={styles.label}>Service Address:</Text>
          <Text style={styles.addressText}>{job.address || 'Address provided upon arrival'}</Text>
        </Card>

        {/* Vehicle Details */}
        <Text style={styles.sectionHeader}>Vehicle</Text>
        <Card variant="default" style={styles.card}>
          <Text style={styles.vehicleTitle}>{job.vehicleSummary || 'Vehicle Details'}</Text>
          <Text style={styles.serviceName}>{job.serviceName || 'Service Order'}</Text>
        </Card>

        {/* Actions based on status */}
        <View style={{ marginTop: 24, gap: 12 }}>
          {['ASSIGNED', 'ON_THE_WAY'].includes(job.status) && (
            <Button
              title="Navigate to Location 🗺️"
              variant="primary"
              size="lg"
              onPress={() => router.push(`/job/${job.id}/navigate`)}
            />
          )}
          {job.status === 'ARRIVED' && (
            <Button
              title="Arrived at Location → Enter Start OTP 🔑"
              variant="secondary"
              size="md"
              onPress={() => router.push(`/job/${job.id}/start`)}
            />
          )}
          {job.status === 'IN_PROGRESS' && (
            <Button
              title="Open Work Console ⚙️"
              variant="primary"
              size="lg"
              onPress={() => router.push(`/job/${job.id}/work`)}
            />
          )}
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
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statusCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  customerName: {
    fontSize: 15,
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
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  serviceName: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '600',
    marginTop: 4,
  },
});
