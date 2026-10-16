import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@gearzo/api-client';
import { Avatar, Card, Badge, Button } from '@gearzo/ui';

export default function AdminProfileIndex() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Profile & Security</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={user?.name || 'Administrator'} size="lg" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.name}>{user?.name || 'System Operator'}</Text>
                <Badge label={user?.role || 'SUPER_ADMIN'} variant="info" />
              </View>
              <Text style={styles.sub}>{user?.email || 'admin@gearzo.in'}</Text>
              <Text style={styles.sub}>Phone: {user?.phone || '+91 99000 11223'}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionHeader}>Security Management</Text>
        <Card variant="default" style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/profile/security')}
          >
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Password & Two-Factor Authentication (TOTP)</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/profile/sessions')}
          >
            <Text style={styles.menuIcon}>💻</Text>
            <Text style={styles.menuText}>Active Admin Sessions & IP Audit</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out of Admin Console ⎋"
          variant="danger"
          size="lg"
          style={{ marginTop: 24 }}
          onPress={handleSignOut}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  menuCard: {
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 46,
  },
});
