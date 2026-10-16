import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

export default function AdminSessionsScreen() {
  const router = useRouter();

  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'MacBook Pro (Chrome 128)',
      ip: '103.21.244.18 (Bengaluru, India)',
      isCurrent: true,
      lastActive: 'Active Now',
    },
    {
      id: 'sess-2',
      device: 'iPad Pro (Safari Mobile)',
      ip: '14.139.155.8 (Bengaluru, India)',
      isCurrent: false,
      lastActive: 'Yesterday, 06:14 PM',
    },
  ]);

  const handleRevoke = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    Alert.alert('Session Terminated', 'Selected device has been logged out.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Operator Sessions</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.device}>{item.device}</Text>
                  {item.isCurrent && <Badge label="CURRENT DEVICE" variant="success" />}
                </View>
                <Text style={styles.meta}>IP: {item.ip}</Text>
                <Text style={styles.lastActive}>{item.lastActive}</Text>
              </View>

              {!item.isCurrent && (
                <TouchableOpacity
                  style={styles.revokeBtn}
                  onPress={() => handleRevoke(item.id)}
                >
                  <Text style={styles.revokeText}>Revoke</Text>
                </TouchableOpacity>
              )}
            </View>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  device: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  lastActive: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  revokeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  revokeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});
