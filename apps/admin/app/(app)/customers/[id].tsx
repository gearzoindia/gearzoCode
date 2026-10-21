import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar, LoadingScreen, EmptyState } from '@gearzo/ui';
import {
  useAdminCustomerDetail,
  useAdminBlockCustomer,
  useAdminUnblockCustomer,
} from '@gearzo/api-client';

export default function AdminCustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: customer, isLoading, error, refetch } = useAdminCustomerDetail(id || '');
  const blockMutation = useAdminBlockCustomer();
  const unblockMutation = useAdminUnblockCustomer();

  if (isLoading) {
    return <LoadingScreen message="Loading customer record..." />;
  }

  if (error || !customer) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <EmptyState
            title="Customer Not Found"
            description="The requested customer profile could not be loaded from the database."
            buttonTitle="Return to Registry"
            onAction={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isBlocked = customer.status === 'BLOCKED' || customer.status === 'SUSPENDED';
  const displayName = customer.name || customer.phone || 'Unnamed Customer';
  const joinedDate = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const handleToggleBlock = () => {
    Alert.alert(
      isBlocked ? 'Unblock Customer Account' : 'Block / Suspend Customer',
      `Are you sure you want to ${isBlocked ? 'unblock' : 'suspend'} ${displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isBlocked ? 'Unblock Account' : 'Suspend Account',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isBlocked) {
                await unblockMutation.mutateAsync({
                  customerId: customer.id,
                  reason: 'Administrative unblock review completed',
                });
                Alert.alert('Account Restored', `${displayName} can now place orders again.`);
              } else {
                await blockMutation.mutateAsync({
                  customerId: customer.id,
                  reason: 'Administrative suspension',
                });
                Alert.alert('Account Suspended', `${displayName} has been blocked and sessions revoked.`);
              }
              refetch();
            } catch (err: any) {
              Alert.alert('Action Failed', err?.response?.data?.message || 'Could not update status.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer: {displayName}</Text>
        <Badge
          label={customer.status || 'ACTIVE'}
          variant={isBlocked ? 'error' : 'success'}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Customer Profile Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={displayName} size="lg" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.title}>{displayName}</Text>
              <Text style={styles.sub}>{customer.phone} {customer.email ? `• ${customer.email}` : ''}</Text>
              <Text style={styles.sub}>
                City: {typeof customer.city === 'string' ? customer.city : customer.city?.name || 'Not specified'} • Registered {joinedDate}
              </Text>
            </View>
          </View>
        </Card>

        {/* Lifetime Stats */}
        <View style={styles.statsRow}>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Lifetime Orders</Text>
            <Text style={styles.statVal}>{customer.totalBookings}</Text>
          </Card>
          <Card variant="default" style={styles.statBox}>
            <Text style={styles.statLabel}>Total Spend</Text>
            <Text style={styles.statVal}>
              ₹{(customer.totalSpentPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </Card>
        </View>

        {/* Registered Vehicles */}
        <Text style={styles.sectionHeader}>Saved Garage Vehicles ({customer.vehicles?.length || 0})</Text>
        {customer.vehicles && customer.vehicles.length > 0 ? (
          <View style={{ gap: 8, marginBottom: 20 }}>
            {customer.vehicles.map((v, i) => (
              <Card key={v.id || i} variant="default" style={{ padding: 14, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                    {v.type === 'TWO_WHEELER' ? '🛵 ' : '🚗 '}
                    {v.model}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>{v.reg}</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card variant="default" style={{ padding: 16, marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#64748B' }}>No vehicles saved in garage yet.</Text>
          </Card>
        )}

        {/* Recent Service Orders */}
        <Text style={styles.sectionHeader}>Recent Service Bookings ({customer.bookings?.length || 0})</Text>
        {customer.bookings && customer.bookings.length > 0 ? (
          <View style={{ gap: 10, marginBottom: 20 }}>
            {customer.bookings.map((b) => (
              <Card key={b.id} variant="default" style={{ padding: 14, borderRadius: 10 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/bookings/${b.id}`)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                      Order #{b.code || b.id.slice(0, 8)}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {b.serviceMode} • ₹{((b.estimatedTotalPaise || 0) / 100).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <Badge label={b.status} variant={b.status === 'COMPLETED' ? 'success' : b.status === 'CANCELLED' ? 'neutral' : 'warning'} />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        ) : (
          <Card variant="default" style={{ padding: 16, marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#64748B' }}>No service bookings placed yet.</Text>
          </Card>
        )}

        {/* Actions */}
        <View style={{ marginTop: 10 }}>
          <Button
            title={
              blockMutation.isPending || unblockMutation.isPending
                ? 'Processing...'
                : isBlocked
                ? 'Unblock Customer Account'
                : 'Block / Suspend Customer'
            }
            variant={isBlocked ? 'primary' : 'danger'}
            size="lg"
            disabled={blockMutation.isPending || unblockMutation.isPending}
            onPress={handleToggleBlock}
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
});
