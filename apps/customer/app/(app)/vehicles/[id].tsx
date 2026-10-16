import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVehicleDetail, useSetDefaultVehicle } from '@gearzo/api-client';
import { Card, Badge, Button, LoadingScreen, ErrorScreen } from '@gearzo/ui';

export default function VehicleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: vehicle, isLoading, isError, refetch } = useVehicleDetail(id || '');
  const setDefaultMutation = useSetDefaultVehicle();

  if (isLoading) {
    return <LoadingScreen message="Loading vehicle details..." />;
  }

  if (isError || !vehicle) {
    return <ErrorScreen message="Vehicle not found." onRetry={refetch} />;
  }

  const handleMakeDefault = async () => {
    try {
      await setDefaultMutation.mutateAsync(vehicle.id);
      Alert.alert('Success', `${vehicle.brand} ${vehicle.model} set as default vehicle.`);
    } catch {
      Alert.alert('Error', 'Failed to update default vehicle.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Main Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 36 }}>
                {vehicle.type === 'TWO_WHEELER' ? '🛵' : vehicle.type === 'COMMERCIAL' ? '🚚' : '🚗'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.brandModel}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                {vehicle.isDefault && <Badge label="Default" variant="success" />}
              </View>
              <Text style={styles.regNumber}>{vehicle.registrationNumber}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Category</Text>
              <Text style={styles.specValue}>{vehicle.type.replace('_', ' ')}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Fuel Engine</Text>
              <Text style={styles.specValue}>{vehicle.fuelType}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Mfg Year</Text>
              <Text style={styles.specValue}>{vehicle.year}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Added On</Text>
              <Text style={styles.specValue}>
                {new Date(vehicle.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </Card>

        {/* Maintenance Shortcuts */}
        <Text style={styles.sectionTitle}>Quick Actions for this Vehicle</Text>
        <View style={{ gap: 12, marginBottom: 24 }}>
          <Button
            title="Book Routine Service"
            variant="primary"
            size="md"
            onPress={() =>
              router.push({
                pathname: '/services',
                params: { vehicleType: vehicle.type, vehicleId: vehicle.id },
              })
            }
          />

          {!vehicle.isDefault && (
            <Button
              title="Set as Default Vehicle"
              variant="outline"
              size="md"
              loading={setDefaultMutation.isPending}
              onPress={handleMakeDefault}
            />
          )}
        </View>
      </ScrollView>
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
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandModel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  regNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 18,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  specItem: {
    width: '45%',
  },
  specLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
});
