import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@gearzo/ui';
import { useSaveMechanicSkills } from '@gearzo/api-client';
import type { VehicleType } from '@gearzo/schemas';

const SERVICES = [
  'Periodic Maintenance & Oil Change',
  'Brake System Overhaul',
  'Engine Diagnostic & Tuning',
  'Electrical Wiring & Battery Diagnostics',
  'Clutch & Transmission',
  'Car Detailing & Foam Wash',
  'Emergency Roadside Jumpstarts',
];

const BRANDS = [
  'Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha',
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota'
];

const EQUIPMENT = [
  'Digital OBD-II Scanner',
  'Hydraulic Floor Jack & Stands',
  'Pneumatic Impact Wrench',
  'Battery Multimeter & Load Tester',
  'Torque Wrench Set',
  'Motorcycle Paddock Stands',
];

export default function OnboardingSkillsScreen() {
  const router = useRouter();

  const [selectedTypes, setSelectedTypes] = useState<VehicleType[]>(['TWO_WHEELER']);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Periodic Maintenance & Oil Change',
    'Brake System Overhaul',
  ]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Hero', 'Honda', 'Bajaj']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    'Battery Multimeter & Load Tester',
    'Torque Wrench Set',
  ]);

  const saveSkillsMutation = useSaveMechanicSkills();

  const toggleType = (t: VehicleType) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) setSelectedTypes(selectedTypes.filter((x) => x !== t));
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const toggleService = (s: string) => {
    if (selectedServices.includes(s)) {
      setSelectedServices(selectedServices.filter((x) => x !== s));
    } else {
      setSelectedServices([...selectedServices, s]);
    }
  };

  const toggleBrand = (b: string) => {
    if (selectedBrands.includes(b)) {
      setSelectedBrands(selectedBrands.filter((x) => x !== b));
    } else {
      setSelectedBrands([...selectedBrands, b]);
    }
  };

  const toggleEquipment = (e: string) => {
    if (selectedEquipment.includes(e)) {
      setSelectedEquipment(selectedEquipment.filter((x) => x !== e));
    } else {
      setSelectedEquipment([...selectedEquipment, e]);
    }
  };

  const handleContinue = async () => {
    try {
      await saveSkillsMutation.mutateAsync({
        vehicleTypes: selectedTypes,
        serviceCategoryIds: selectedServices,
      });
    } catch {
      // Proceed
    }

    router.push('/(onboarding)/location');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: '48%' }]} />
        </View>
        <Text style={styles.stepCount}>Step 3 of 6: Skills & Toolsets</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.title}>Your Skills & Equipment</Text>
          <Text style={styles.subtitle}>
            We match jobs based on the vehicle categories and toolsets you own.
          </Text>

          {/* Vehicle Types */}
          <Text style={styles.sectionHeader}>Vehicles Serviced</Text>
          <View style={styles.gridRow}>
            {(['TWO_WHEELER', 'FOUR_WHEELER', 'COMMERCIAL'] as VehicleType[]).map((t) => {
              const isSelected = selectedTypes.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleType(t)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {t === 'TWO_WHEELER' ? '🛵 2-Wheeler' : t === 'FOUR_WHEELER' ? '🚗 4-Wheeler' : '🚚 Commercial'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Services */}
          <Text style={styles.sectionHeader}>Service Capabilities</Text>
          <View style={styles.gridRow}>
            {SERVICES.map((srv) => {
              const isSelected = selectedServices.includes(srv);
              return (
                <TouchableOpacity
                  key={srv}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleService(srv)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{srv}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Brands */}
          <Text style={styles.sectionHeader}>Brand Specializations</Text>
          <View style={styles.gridRow}>
            {BRANDS.map((br) => {
              const isSelected = selectedBrands.includes(br);
              return (
                <TouchableOpacity
                  key={br}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleBrand(br)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{br}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Equipment */}
          <Text style={styles.sectionHeader}>Tools & Equipment You Own</Text>
          <View style={styles.gridRow}>
            {EQUIPMENT.map((eq) => {
              const isSelected = selectedEquipment.includes(eq);
              return (
                <TouchableOpacity
                  key={eq}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleEquipment(eq)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>🔧 {eq}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingTop: 24 }}>
          <Button
            title="Continue to Service Location →"
            variant="primary"
            size="lg"
            loading={saveSkillsMutation.isPending}
            onPress={handleContinue}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1B5E20',
  },
  stepCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 18,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#1B5E20',
  },
});
