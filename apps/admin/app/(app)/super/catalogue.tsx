import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';
import { useAdminCatalogueServices } from '@gearzo/api-client';

export default function CatalogueMasterScreen() {
  const router = useRouter();
  const { data: services, isLoading, isError } = useAdminCatalogueServices();

  const displayServices = Array.isArray(services) ? services : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Service Catalogue Master</Text>
          <Text style={styles.sub}>Configure service definitions, checklists, SLA durations & base rates</Text>
        </View>

        <Button
          title="+ Add Service Definition"
          variant="primary"
          size="sm"
          onPress={() => Alert.alert('Add Service', 'Create new service modal')}
        />
      </View>

      <FlatList
        data={displayServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>📋</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>No Services Configured</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              Service catalogue is empty. Click '+ Add Service Definition' to add one.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Badge label={item.status} variant="success" />
                </View>
                <Text style={styles.meta}>
                  ⏱ {item.durationMinutes} mins • Applicable for: {item.vehicleTypes.join(', ')}
                </Text>
              </View>

              <Text style={styles.price}>₹{(item.basePricePaise / 100).toLocaleString('en-IN')}</Text>
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
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
  },
});
