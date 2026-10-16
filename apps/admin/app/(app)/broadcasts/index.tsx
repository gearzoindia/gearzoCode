import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

export default function BroadcastsIndexScreen() {
  const router = useRouter();

  const broadcasts = [
    {
      id: 'bc-1',
      title: 'Monsoon Care Campaign Flat 20% OFF',
      audience: 'ALL_CUSTOMERS',
      sentAt: '12 Oct 2026, 09:00 AM',
      deliveredCount: 14820,
    },
    {
      id: 'bc-2',
      title: 'Surge Pricing Alert: High Demand in Koramangala',
      audience: 'MECHANICS_ONLINE',
      sentAt: '11 Oct 2026, 05:30 PM',
      deliveredCount: 68,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Push Broadcasts</Text>
          <Text style={styles.sub}>Send announcements & marketing alerts to users or mechanics</Text>
        </View>

        <Button
          title="+ Create Broadcast"
          variant="primary"
          size="sm"
          onPress={() => router.push('/broadcasts/new')}
        />
      </View>

      <FlatList
        data={broadcasts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Badge label={item.audience.replace('_', ' ')} variant="info" />
                </View>
                <Text style={styles.meta}>
                  Sent {item.sentAt} • {item.deliveredCount.toLocaleString('en-IN')} Delivered
                </Text>
              </View>
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
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
  },
});
