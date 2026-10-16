import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar } from '@gearzo/ui';

export default function AdminMechanicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const mechanic = {
    id: id || 'm-101',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    type: 'INDIVIDUAL',
    kycStatus: 'VERIFIED',
    rating: 4.89,
    isOnline: true,
    totalJobs: 342,
    completionRate: '98.5%',
    operatingRadius: '5 km (Indiranagar Base)',
    bankAccount: 'HDFC Bank ending in 1234',
    joinedDate: 'Jan 2026',
  };

  const handleSuspend = () => {
    Alert.alert('Suspend Partner', 'Are you sure you want to suspend this mechanic?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Suspend', style: 'destructive', onPress: () => Alert.alert('Suspended') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Profile: {mechanic.name}</Text>
        <Badge label={mechanic.kycStatus} variant="success" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Profile Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={mechanic.name} size="lg" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.title}>{mechanic.name}</Text>
              <Text style={styles.sub}>{mechanic.phone} • {mechanic.type}</Text>
              <Text style={styles.sub}>Base: {mechanic.operatingRadius}</Text>
            </View>
          </View>
        </Card>

        {/* Performance Metrics */}
        <Text style={styles.sectionHeader}>Operational Performance</Text>
        <View style={styles.statsRow}>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Completed Jobs</Text>
            <Text style={styles.statVal}>{mechanic.totalJobs}</Text>
          </Card>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Customer Rating</Text>
            <Text style={styles.statVal}>{mechanic.rating} ★</Text>
          </Card>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Fulfillment Rate</Text>
            <Text style={styles.statVal}>{mechanic.completionRate}</Text>
          </Card>
        </View>

        {/* Bank & Compliance */}
        <Text style={styles.sectionHeader}>Settlement & Compliance</Text>
        <Card variant="default" style={styles.card}>
          <Text style={styles.infoRow}>Bank Account: {mechanic.bankAccount}</Text>
          <Text style={styles.infoRow}>KYC Status: Government Verified (Aadhaar & PAN)</Text>
          <Text style={styles.infoRow}>Partner Since: {mechanic.joinedDate}</Text>
        </Card>

        {/* Actions */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <Button
            title="Inspect KYC Documents"
            variant="outline"
            size="md"
            onPress={() => router.push(`/mechanics/kyc/${mechanic.id}`)}
          />
          <Button
            title="Suspend Partner Account"
            variant="danger"
            size="md"
            onPress={handleSuspend}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  infoRow: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
  },
});
