import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminCustomers } from '@gearzo/api-client';
import { Card, Avatar, LoadingScreen } from '@gearzo/ui';

export default function AdminCustomersIndex() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useAdminCustomers(search || undefined);

  const mockCustomers = customers || [
    {
      id: 'cust-1',
      name: 'Anand Verma',
      phone: '+91 98765 43210',
      email: 'anand.verma@example.com',
      totalBookings: 8,
      totalSpentPaise: 1120000,
      createdAt: '2025-11-12T00:00:00Z',
    },
    {
      id: 'cust-2',
      name: 'Priya Rajan',
      phone: '+91 98111 22334',
      email: 'priya.r@example.com',
      totalBookings: 3,
      totalSpentPaise: 385000,
      createdAt: '2026-02-04T00:00:00Z',
    },
    {
      id: 'cust-3',
      name: 'Karthik Somani',
      phone: '+91 97410 55667',
      email: 'karthik.s@example.com',
      totalBookings: 1,
      totalSpentPaise: 149900,
      createdAt: '2026-06-18T00:00:00Z',
    },
  ];

  if (isLoading) {
    return <LoadingScreen message="Loading customers registry..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Customers Registry</Text>
          <Text style={styles.sub}>Manage vehicle owners, order history & account status</Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone or email..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={mockCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/customers/${item.id}`)}
              style={styles.row}
            >
              <Avatar name={item.name} size="md" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone} • {item.email || 'No email'}</Text>
                <Text style={styles.meta}>
                  {item.totalBookings} orders • Total spent ₹{(item.totalSpentPaise / 100).toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={{ fontSize: 20, color: '#94A3B8' }}>›</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
    minWidth: 260,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  card: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  phone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    marginTop: 2,
  },
});
