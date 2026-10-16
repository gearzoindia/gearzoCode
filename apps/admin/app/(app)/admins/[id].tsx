import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar } from '@gearzo/ui';

export default function AdminStaffDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const admin = {
    id: id || 'adm-1',
    name: 'Vikram Sundaram',
    email: 'vikram.ops@gearzo.in',
    role: 'OPS_MANAGER',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLogin: 'Today, 09:30 AM',
    permissions: [
      'View & Edit Bookings',
      'Approve / Reject KYC Queue',
      'Reassign Mechanics',
      'Submit Ledger Adjustments (Maker)',
      'Inspect Financial Reports',
    ],
  };

  const handleRevoke = () => {
    Alert.alert('Revoke Access', 'Are you sure you want to deactivate this operator account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operator: {admin.name}</Text>
        <Badge label={admin.role} variant="info" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={admin.name} size="lg" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.name}>{admin.name}</Text>
              <Text style={styles.email}>{admin.email}</Text>
              <Text style={styles.sub}>2FA Status: Enrolled & Enforced ✓</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionHeader}>Role Capabilities</Text>
        <Card variant="default" style={styles.card}>
          <View style={{ gap: 8 }}>
            {admin.permissions.map((p, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#166534', marginRight: 8, fontWeight: '800' }}>✓</Text>
                <Text style={{ fontSize: 13, color: '#334155' }}>{p}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ marginTop: 24 }}>
          <Button
            title="Revoke Administrative Access ⚠️"
            variant="danger"
            size="lg"
            onPress={handleRevoke}
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
});
