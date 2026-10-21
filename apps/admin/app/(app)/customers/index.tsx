import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminCustomers } from '@gearzo/api-client';
import { Card, Avatar, LoadingScreen } from '@gearzo/ui';

export default function AdminCustomersIndex() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: customers, isLoading, isError, refetch } = useAdminCustomers(search || undefined);

  if (isLoading) {
    return <LoadingScreen message="Loading customers registry..." />;
  }

  const displayCustomers = Array.isArray(customers) ? customers : [];

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
        data={displayCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>👥</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>
              {isError ? 'Unable to load customers' : 'No Customers Found'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              {isError
                ? 'Could not connect to the customers service. Please check API server.'
                : search
                ? 'No customers matching your search criteria.'
                : 'No customer accounts registered in the database yet.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const customerName = item.name || item.phone || 'Customer';
          return (
            <Card variant="default" style={styles.card}>
              <TouchableOpacity
                onPress={() => router.push(`/customers/${item.id}`)}
                style={styles.row}
              >
                <Avatar name={customerName} size="md" />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.name}>{customerName}</Text>
                  <Text style={styles.phone}>{item.phone} • {item.email || 'No email registered'}</Text>
                  <Text style={styles.meta}>
                    {item.totalBookings} orders • Total spent ₹{(item.totalSpentPaise / 100).toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: '#94A3B8' }}>›</Text>
              </TouchableOpacity>
            </Card>
          );
        }}
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
