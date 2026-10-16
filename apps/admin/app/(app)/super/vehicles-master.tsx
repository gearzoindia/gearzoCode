import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';
import { useAdminVehicleBrands } from '@gearzo/api-client';

export default function VehiclesMasterScreen() {
  const router = useRouter();
  const { data: brandsData } = useAdminVehicleBrands();

  const [brands, setBrands] = useState([
    { id: 'b-1', name: 'Hero MotoCorp', type: 'TWO_WHEELER', modelsCount: 24, status: 'ACTIVE' },
    { id: 'b-2', name: 'Honda Motorcycles & Scooters', type: 'TWO_WHEELER', modelsCount: 32, status: 'ACTIVE' },
    { id: 'b-3', name: 'Royal Enfield', type: 'TWO_WHEELER', modelsCount: 16, status: 'ACTIVE' },
    { id: 'b-4', name: 'Maruti Suzuki', type: 'FOUR_WHEELER', modelsCount: 28, status: 'ACTIVE' },
    { id: 'b-5', name: 'Hyundai Motor India', type: 'FOUR_WHEELER', modelsCount: 22, status: 'ACTIVE' },
    { id: 'b-6', name: 'Tata Motors', type: 'FOUR_WHEELER', modelsCount: 18, status: 'ACTIVE' },
    { id: 'b-7', name: 'Ather Energy (EV)', type: 'TWO_WHEELER', modelsCount: 6, status: 'ACTIVE' },
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vehicle Brands & Models Master</Text>
          <Text style={styles.sub}>Master taxonomy of OEM manufacturers, variants, engine displacements & fuel specs</Text>
        </View>

        <Button
          title="+ Add Vehicle OEM"
          variant="primary"
          size="sm"
          onPress={() => Alert.alert('Add OEM', 'Create brand master modal')}
        />
      </View>

      <FlatList
        data={brands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.brandName}>{item.name}</Text>
                  <Badge label={item.type.replace('_', ' ')} variant="info" />
                </View>
                <Text style={styles.modelsCount}>{item.modelsCount} Registered Models & Variants</Text>
              </View>

              <Badge label={item.status} variant="success" />
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
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  modelsCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
