import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminMechanics } from '@gearzo/api-client';
import { Card, Badge, Avatar, LoadingScreen } from '@gearzo/ui';

export default function AdminMechanicsListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: mechanics, isLoading, isError, refetch } = useAdminMechanics(search || undefined);

  if (isLoading) {
    return <LoadingScreen message="Loading mechanics directory..." />;
  }

  const displayMechanics = Array.isArray(mechanics) ? mechanics : [];

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
        data={displayMechanics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🔧</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>No Mechanics Found</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              {search ? 'No mechanics matching your search query.' : 'No mechanic partners onboarded yet.'}
            </Text>
          </View>
        }
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
