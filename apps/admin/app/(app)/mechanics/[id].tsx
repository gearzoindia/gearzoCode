import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar, LoadingScreen, EmptyState } from '@gearzo/ui';
import { useAdminMechanicDetail } from '@gearzo/api-client';

export default function AdminMechanicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: mechanic, isLoading, error } = useAdminMechanicDetail(id || '');

  if (isLoading) {
    return <LoadingScreen message="Loading partner profile..." />;
  }

  if (error || !mechanic) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Partner Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <EmptyState
            title="Partner Not Found"
            description="The requested mechanic profile could not be retrieved from the database."
            buttonTitle="Return to Directory"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = mechanic.name || mechanic.phone || 'Mechanic Partner';
  const isOnline = mechanic.presence?.status === 'ONLINE_AVAILABLE';
  const joinedDate = mechanic.createdAt
    ? new Date(mechanic.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Recently';

  const handleSuspend = () => {
    Alert.alert('Suspend Partner', `Are you sure you want to suspend ${displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: () => Alert.alert('Action Pending', 'Mechanic suspension workflow triggered.'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Profile: {displayName}</Text>
        <Badge
          label={mechanic.status || 'ACTIVE'}
          variant={mechanic.status === 'ACTIVE' || mechanic.status === 'VERIFIED' ? 'success' : 'warning'}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Profile Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={displayName} size="lg" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.title}>{displayName}</Text>
                <Badge
                  label={isOnline ? 'ONLINE' : 'OFFLINE'}
                  variant={isOnline ? 'success' : 'neutral'}
                />
              </View>
              <Text style={styles.sub}>{mechanic.phone} • {mechanic.registrationType || 'INDIVIDUAL'}</Text>
              {mechanic.profile?.shopName && (
                <Text style={styles.sub}>Workshop: {mechanic.profile.shopName}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Performance Metrics */}
        <Text style={styles.sectionHeader}>Operational Performance</Text>
        <View style={styles.statsRow}>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Completed Jobs</Text>
            <Text style={styles.statVal}>{mechanic.bookings?.length || 0}</Text>
          </Card>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Customer Rating</Text>
            <Text style={styles.statVal}>
              {mechanic.profile?.ratingAvg ? Number(mechanic.profile.ratingAvg).toFixed(1) : '5.0'} ★
            </Text>
          </Card>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statVal}>{mechanic.profile?.experienceYears || 0} yrs</Text>
          </Card>
        </View>

        {/* Bank & Compliance */}
        <Text style={styles.sectionHeader}>Settlement & Compliance</Text>
        <Card variant="default" style={styles.card}>
          <Text style={styles.infoRow}>
            Bank Account:{' '}
            {mechanic.bankAccount?.accountNumber
              ? `A/C ending in ${mechanic.bankAccount.accountNumber.slice(-4)}`
              : 'Not registered yet'}
          </Text>
          <Text style={styles.infoRow}>KYC Status: {mechanic.status || 'PENDING_PROFILE'}</Text>
          <Text style={styles.infoRow}>Service Radius: {mechanic.profile?.serviceRadiusKm || 5} km</Text>
          <Text style={styles.infoRow}>Partner Registered: {joinedDate}</Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  infoRow: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 22,
  },
});
