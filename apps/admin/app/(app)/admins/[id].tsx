import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useAdminStaffDetail } from '@gearzo/api-client';

export default function AdminStaffDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: admin, isLoading, error } = useAdminStaffDetail(id || '');

  if (isLoading) {
    return <LoadingScreen message="Loading administrator profile..." />;
  }

  if (error || !admin) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Operator Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <EmptyState
            title="Administrator Not Found"
            description="The requested operator profile could not be located in the system."
            buttonTitle="Return to Staff"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = admin.name || admin.email || 'Administrator';
  const role = admin.role || 'OPERATOR';

  const handleRevoke = () => {
    Alert.alert('Revoke Access', `Are you sure you want to deactivate ${displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Action Logged', 'Operator deactivation requested.');
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operator: {displayName}</Text>
        <Badge label={role} variant="info" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={displayName} size="lg" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.email}>{admin.email}</Text>
              <Text style={styles.sub}>
                Jurisdiction: {admin.jurisdiction?.name || 'All Territories'}
              </Text>
              <Text style={styles.sub}>
                2FA Status: {admin.totpEnabled ? 'Enrolled & Enforced ✓' : 'Optional / Not Configured'}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionHeader}>Role Capabilities</Text>
        <Card variant="default" style={styles.card}>
          <View style={{ gap: 8 }}>
            {admin.role === 'SUPER_ADMIN' ? (
              <Text style={styles.permText}>✓ Full Unrestricted Super-Administrator Access</Text>
            ) : (
              <Text style={styles.permText}>✓ Standard Role Permissions for {admin.role}</Text>
            )}
          </View>
        </Card>

        <View style={{ marginTop: 24 }}>
          <Button
            title="Deactivate Operator Account"
            variant="danger"
            size="md"
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
    padding: 18,
    borderRadius: 14,
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
    color: '#64748B',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  permText: {
    fontSize: 13,
    color: '#334155',
  },
});
