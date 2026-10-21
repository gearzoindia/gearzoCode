import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Avatar, LoadingScreen } from '@gearzo/ui';
import { useAdminStaffList } from '@gearzo/api-client';

export default function AdminsListScreen() {
  const router = useRouter();
  const { data: staff, isLoading, isError } = useAdminStaffList();

  if (isLoading) {
    return <LoadingScreen message="Loading administrative personnel..." />;
  }

  const staffList = Array.isArray(staff) ? staff : [];

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
        data={staffList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🛡️</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>
              {isError ? 'Unable to load operators' : 'No Subordinate Administrators'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              {isError
                ? 'Could not connect to the administration service.'
                : 'No operator or manager accounts created under this jurisdiction yet.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const name = item.name || item.email || 'Administrator';
          const lastLogin = item.lastLoginAt
            ? new Date(item.lastLoginAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Never logged in';
          return (
            <Card variant="default" style={styles.card}>
              <TouchableOpacity
                onPress={() => router.push(`/admins/${item.id}`)}
                style={styles.row}
              >
                <Avatar name={name} size="md" />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Badge label={item.role} variant="info" />
                  </View>
                  <Text style={styles.email}>{item.email}</Text>
                  <Text style={styles.lastLogin}>Last login: {lastLogin}</Text>
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
