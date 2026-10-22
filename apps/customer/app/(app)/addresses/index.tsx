import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, EmptyState, LoadingScreen } from '@gearzo/ui';
import { useAddresses } from '@gearzo/api-client';

export default function AddressesScreen() {
  const router = useRouter();
  const { data: addresses, isLoading, refetch, isRefetching } = useAddresses();

  if (isLoading && !isRefetching) {
    return <LoadingScreen message="Loading saved addresses..." />;
  }

  const list = Array.isArray(addresses) ? addresses : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => router.push('/addresses/edit')} style={styles.backBtn}>
          <Text style={{ fontSize: 24, color: '#16A34A', fontWeight: '700' }}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, list.length === 0 && { flex: 1, justifyContent: 'center' }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16A34A" />}
        ListEmptyComponent={
          <EmptyState
            title="No Addresses Saved"
            description="Add your home, office or garage location for quick doorstep service booking."
            buttonTitle="+ Add New Address"
            onAction={() => router.push('/addresses/edit')}
          />
        }
        renderItem={({ item }) => {
          const labelUpper = (item.label || 'HOME').toUpperCase();
          const icon = labelUpper === 'HOME' ? '🏠' : labelUpper === 'WORK' ? '🏢' : '📍';
          const line = [item.line1, item.line2].filter(Boolean).join(', ');

          return (
            <Card variant="default" style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>{icon}</Text>
                  <Text style={styles.tagText}>{labelUpper}</Text>
                  {item.isDefault && <Badge label="Default" variant="success" />}
                </View>
              </View>

              <Text style={styles.addressLine}>{line}</Text>
              {item.landmark ? (
                <Text style={styles.landmark}>Landmark: {item.landmark}</Text>
              ) : null}
            </Card>
          );
        }}
      />

      <View style={styles.bottomBar}>
        <Button
          title="+ Add New Address"
          variant="primary"
          size="lg"
          onPress={() => router.push('/addresses/edit')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  addressLine: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 4,
  },
  landmark: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
});
