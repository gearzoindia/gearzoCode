import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar } from '@gearzo/ui';

export default function AdminCustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isBlocked, setIsBlocked] = useState(false);

  const customer = {
    id: id || 'cust-1',
    name: 'Anand Verma',
    phone: '+91 98765 43210',
    email: 'anand.verma@example.com',
    city: 'Bengaluru, Karnataka',
    totalBookings: 8,
    totalSpentPaise: 1120000,
    walletBalancePaise: 25000,
    joinedDate: 'Nov 2025',
    vehicles: [
      { model: 'Royal Enfield Classic 350', reg: 'KA05MB9912', type: 'TWO_WHEELER' },
      { model: 'Maruti Suzuki Baleno', reg: 'KA01MC4401', type: 'FOUR_WHEELER' },
    ],
  };

  const handleToggleBlock = () => {
    Alert.alert(
      isBlocked ? 'Unblock Customer' : 'Block Customer',
      `Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this customer account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isBlocked ? 'Unblock' : 'Block Account',
          style: 'destructive',
          onPress: () => setIsBlocked(!isBlocked),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer: {customer.name}</Text>
        <Badge
          label={isBlocked ? 'SUSPENDED' : 'ACTIVE'}
          variant={isBlocked ? 'error' : 'success'}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Customer Profile Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={customer.name} size="lg" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.title}>{customer.name}</Text>
              <Text style={styles.sub}>{customer.phone} • {customer.email}</Text>
              <Text style={styles.sub}>City: {customer.city} • Customer since {customer.joinedDate}</Text>
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
            <Text style={styles.statVal}>₹{(customer.totalSpentPaise / 100).toLocaleString('en-IN')}</Text>
          </Card>
        </View>

        {/* Registered Vehicles */}
        <Text style={styles.sectionHeader}>Saved Garage Vehicles</Text>
        <View style={{ gap: 8, marginBottom: 16 }}>
          {customer.vehicles.map((v, i) => (
            <Card key={i} variant="default" style={{ padding: 14, borderRadius: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                  {v.type === 'TWO_WHEELER' ? '🛵 ' : '🚗 '}
                  {v.model}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>{v.reg}</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Actions */}
        <View style={{ marginTop: 20, gap: 10 }}>
          <Button
            title={isBlocked ? 'Unblock Customer Account' : 'Block / Suspend Customer'}
            variant={isBlocked ? 'primary' : 'danger'}
            size="lg"
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
