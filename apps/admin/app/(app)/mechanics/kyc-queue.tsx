import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminKycQueue } from '@gearzo/api-client';
import { Card, Badge, EmptyState, LoadingScreen } from '@gearzo/ui';

export default function AdminKycQueueScreen() {
  const router = useRouter();
  const { data: queue, isLoading, isError, refetch, isRefetching } = useAdminKycQueue();

  const displayQueue = Array.isArray(queue) ? queue : [];

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading KYC review queue..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>KYC Verification Queue</Text>
          <Text style={styles.sub}>Review government identification proofs (Oldest first)</Text>
        </View>
        <Badge label={`${displayQueue.length} PENDING`} variant="warning" />
      </View>

      <FlatList
        data={displayQueue}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Card variant="default" style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/mechanics/kyc/${item.id}`)}
              style={styles.row}
            >
              <View style={styles.badgeIndex}>
                <Text style={styles.badgeIndexText}>#{index + 1}</Text>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone} • {item.type}</Text>
                <Text style={styles.submitted}>Submitted 2 hrs ago • Documents attached</Text>
              </View>

              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => router.push(`/mechanics/kyc/${item.id}`)}
              >
                <Text style={styles.reviewBtnText}>Review Docs →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="KYC Queue Clear! 🎉"
            description="All partner document submissions have been verified and processed."
            buttonTitle="Refresh Queue"
            onAction={refetch}
          />
        }
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
  badgeIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
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
  submitted: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 2,
  },
  reviewBtn: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
