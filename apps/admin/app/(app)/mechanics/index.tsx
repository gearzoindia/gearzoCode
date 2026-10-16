import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminMechanics } from '@gearzo/api-client';
import { Card, Badge, Avatar, LoadingScreen } from '@gearzo/ui';

export default function AdminMechanicsListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: mechanics, isLoading, refetch } = useAdminMechanics(search || undefined);

  const mockMechanics = mechanics || [
    {
      id: 'm-101',
      name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      type: 'INDIVIDUAL',
      kycStatus: 'VERIFIED',
      rating: 4.89,
      isOnline: true,
      totalJobs: 342,
    },
    {
      id: 'm-102',
      name: 'Shiva Auto Garage (Santosh S.)',
      phone: '+91 98112 23344',
      type: 'SHOP',
      kycStatus: 'VERIFIED',
      rating: 4.75,
      isOnline: true,
      totalJobs: 620,
    },
    {
      id: 'm-103',
      name: 'Vijay Verma',
      phone: '+91 99001 12233',
      type: 'INDIVIDUAL',
      kycStatus: 'SUBMITTED',
      rating: 0,
      isOnline: false,
      totalJobs: 0,
    },
  ];

  if (isLoading) {
    return <LoadingScreen message="Loading mechanics directory..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mechanics & Service Partners</Text>
          <Text style={styles.sub}>Verified technicians directory & duty status</Text>
        </View>

        <TouchableOpacity
          style={styles.kycBtn}
          onPress={() => router.push('/mechanics/kyc-queue')}
        >
          <Text style={styles.kycBtnText}>Pending KYC Queue 🪪</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockMechanics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/mechanics/${item.id}`)}
              style={styles.row}
            >
              <Avatar name={item.name} size="md" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Badge
                    label={item.isOnline ? 'ONLINE' : 'OFFLINE'}
                    variant={item.isOnline ? 'success' : 'neutral'}
                  />
                </View>
                <Text style={styles.phone}>{item.phone} • {item.type}</Text>
                <Text style={styles.meta}>
                  ★ {item.rating > 0 ? item.rating : 'New'} • {item.totalJobs} jobs completed
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
    gap: 10,
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
  kycBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  kycBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
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
