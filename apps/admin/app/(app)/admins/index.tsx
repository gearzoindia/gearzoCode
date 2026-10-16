import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar } from '@gearzo/ui';

export default function AdminsListScreen() {
  const router = useRouter();

  const admins = [
    {
      id: 'adm-1',
      name: 'Praveen Rao',
      email: 'praveen@gearzo.in',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      lastLogin: 'Today, 10:14 AM',
    },
    {
      id: 'adm-2',
      name: 'Vikram Sundaram',
      email: 'vikram.ops@gearzo.in',
      role: 'OPS_MANAGER',
      status: 'ACTIVE',
      lastLogin: 'Today, 09:30 AM',
    },
    {
      id: 'adm-3',
      name: 'Priya Sharma',
      email: 'priya.support@gearzo.in',
      role: 'SUPPORT_EXECUTIVE',
      status: 'ACTIVE',
      lastLogin: 'Yesterday, 05:45 PM',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Administrative Staff & Roles</Text>
          <Text style={styles.sub}>Role-based access control (RBAC) & portal security</Text>
        </View>

        <Button
          title="+ Invite Admin Staff"
          variant="primary"
          size="sm"
          onPress={() => router.push('/admins/invite')}
        />
      </View>

      <FlatList
        data={admins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/admins/${item.id}`)}
              style={styles.row}
            >
              <Avatar name={item.name} size="md" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Badge label={item.role} variant="info" />
                </View>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.lastLogin}>Last authenticated: {item.lastLogin}</Text>
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
  card: {
    padding: 16,
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
  email: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  lastLogin: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
