import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@gearzo/ui';
import { useSaveMechanicType } from '@gearzo/api-client';
import type { MechanicType } from '@gearzo/schemas';

export default function OnboardingTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<MechanicType>('INDIVIDUAL');

  const saveTypeMutation = useSaveMechanicType();

  const handleContinue = async () => {
    try {
      await saveTypeMutation.mutateAsync(selectedType);
    } catch {
      // Proceed even if offline
    }
    router.push({
      pathname: '/(onboarding)/profile',
      params: { mechanicType: selectedType },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Progress */}
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: '15%' }]} />
        </View>
        <Text style={styles.stepCount}>Step 1 of 6: Partner Model</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.title}>How do you want to partner?</Text>
          <Text style={styles.subtitle}>
            Select the work profile that best matches your automotive service operations.
          </Text>

          <View style={{ gap: 14, marginTop: 20 }}>
            {/* 1. Garage / Workshop */}
            <TouchableOpacity
              style={[styles.typeCard, selectedType === 'SHOP' && styles.typeCardActive]}
              onPress={() => setSelectedType('SHOP')}
            >
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 32 }}>🏬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>Garage / Workshop Owner</Text>
                <Text style={styles.typeDesc}>
                  Own an auto repair garage or multi-bay service station. Manage a fleet of mechanics.
                </Text>
              </View>
              <View style={[styles.radio, selectedType === 'SHOP' && styles.radioActive]} />
            </TouchableOpacity>

            {/* 2. Individual Mechanic */}
            <TouchableOpacity
              style={[styles.typeCard, selectedType === 'INDIVIDUAL' && styles.typeCardActive]}
              onPress={() => setSelectedType('INDIVIDUAL')}
            >
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 32 }}>🛵</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>Independent Mobile Mechanic</Text>
                <Text style={styles.typeDesc}>
                  Freelance doorstep technician with personal toolkit and bike for emergency visits.
                </Text>
              </View>
              <View style={[styles.radio, selectedType === 'INDIVIDUAL' && styles.radioActive]} />
            </TouchableOpacity>

            {/* 3. Direct Job */}
            <TouchableOpacity
              style={[styles.typeCard, selectedType === 'DIRECT_JOB' && styles.typeCardActive]}
              onPress={() => setSelectedType('DIRECT_JOB')}
            >
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 32 }}>👔</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>GearZo Direct Technician</Text>
                <Text style={styles.typeDesc}>
                  Full-time salaried role with company-provided gear, electric scooter, and benefits.
                </Text>
              </View>
              <View style={[styles.radio, selectedType === 'DIRECT_JOB' && styles.radioActive]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingTop: 24 }}>
          <Button
            title="Continue to Profile Details →"
            variant="primary"
            size="lg"
            loading={saveTypeMutation.isPending}
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
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  typeCardActive: {
    borderColor: '#1B5E20',
    backgroundColor: '#F0FDF4',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  typeDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginLeft: 8,
  },
  radioActive: {
    borderColor: '#1B5E20',
    backgroundColor: '#1B5E20',
  },
});
