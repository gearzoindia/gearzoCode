import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';
import { useAddVehicle } from '@gearzo/api-client';
import type { VehicleType, VehicleFuel } from '@gearzo/schemas';

type WizardStep = 1 | 2 | 3 | 4 | 5;

const BRANDS_BY_TYPE: Record<VehicleType, string[]> = {
  TWO_WHEELER: ['Honda', 'Hero', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'Ather', 'Ola'],
  FOUR_WHEELER: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'Volkswagen'],
  COMMERCIAL: ['Tata Motors', 'Mahindra', 'Ashok Leyland', 'Eicher', 'Force Motors'],
};

const FUEL_TYPES: { key: VehicleFuel; label: string; icon: string }[] = [
  { key: 'PETROL', label: 'Petrol', icon: '⛽' },
  { key: 'DIESEL', label: 'Diesel', icon: '🛢️' },
  { key: 'ELECTRIC', label: 'Electric (EV)', icon: '⚡' },
  { key: 'CNG', label: 'CNG', icon: '💨' },
  { key: 'HYBRID', label: 'Hybrid', icon: '🔋' },
];

export default function AddVehicleScreen() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);

  const [type, setType] = useState<VehicleType>('TWO_WHEELER');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [fuelType, setFuelType] = useState<VehicleFuel>('PETROL');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addVehicleMutation = useAddVehicle();

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!brand) {
        setErrorMsg('Please select a vehicle brand');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!model.trim()) {
        setErrorMsg('Please enter your vehicle model name');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    const cleanedReg = registrationNumber.replace(/\s+/g, '').toUpperCase();
    if (cleanedReg.length < 5) {
      setErrorMsg('Please enter a valid registration number (e.g. KA01AB1234)');
      return;
    }

    try {
      const saved: any = await addVehicleMutation.mutateAsync({
        type,
        brand,
        model: model.trim(),
        registrationNumber: cleanedReg,
        fuelType,
        year,
        isDefault,
      });
      const savedVehicle = saved?.data ?? saved;
      // Take the customer straight to the services available for the vehicle just saved
      router.replace({
        pathname: '/services',
        params: {
          vehicleType: savedVehicle?.type || type,
          ...(savedVehicle?.id ? { vehicleId: savedVehicle.id } : {}),
        },
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error?.response?.data?.message || 'Failed to add vehicle. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Step Indicator Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep((s) => (s - 1) as WizardStep) : router.back())}
            style={styles.backBtn}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${(step / 5) * 100}%` }]} />
            </View>
          </View>
          <Text style={styles.stepCount}>Step {step} of 5</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Step 1: Vehicle Type */}
            {step === 1 && (
              <View>
                <Text style={styles.stepTitle}>Select Vehicle Type</Text>
                <Text style={styles.stepSub}>Choose the vehicle you want serviced</Text>

                <View style={{ gap: 12, marginTop: 20 }}>
                  <TouchableOpacity
                    style={[styles.typeCard, type === 'TWO_WHEELER' && styles.typeCardSelected]}
                    onPress={() => setType('TWO_WHEELER')}
                  >
                    <Text style={{ fontSize: 36, marginRight: 16 }}>🛵</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeCardTitle}>2-Wheeler</Text>
                      <Text style={styles.typeCardSub}>Motorcycle, Scooter, Moped, Superbike</Text>
                    </View>
                    {type === 'TWO_WHEELER' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeCard, type === 'FOUR_WHEELER' && styles.typeCardSelected]}
                    onPress={() => setType('FOUR_WHEELER')}
                  >
                    <Text style={{ fontSize: 36, marginRight: 16 }}>🚗</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeCardTitle}>4-Wheeler</Text>
                      <Text style={styles.typeCardSub}>Hatchback, Sedan, SUV, Luxury</Text>
                    </View>
                    {type === 'FOUR_WHEELER' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeCard, type === 'COMMERCIAL' && styles.typeCardSelected]}
                    onPress={() => setType('COMMERCIAL')}
                  >
                    <Text style={{ fontSize: 36, marginRight: 16 }}>🚚</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeCardTitle}>Commercial</Text>
                      <Text style={styles.typeCardSub}>Auto Rickshaw, Mini Van, Light Truck</Text>
                    </View>
                    {type === 'COMMERCIAL' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 2: Brand */}
            {step === 2 && (
              <View>
                <Text style={styles.stepTitle}>Select Vehicle Brand</Text>
                <Text style={styles.stepSub}>Who manufactured your vehicle?</Text>

                <View style={styles.brandGrid}>
                  {BRANDS_BY_TYPE[type].map((b) => {
                    const isSelected = brand === b;
                    return (
                      <TouchableOpacity
                        key={b}
                        style={[styles.brandItem, isSelected && styles.brandItemSelected]}
                        onPress={() => setBrand(b)}
                      >
                        <Text style={[styles.brandText, isSelected && styles.brandTextSelected]}>
                          {b}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Step 3: Model */}
            {step === 3 && (
              <View>
                <Text style={styles.stepTitle}>Enter Vehicle Model</Text>
                <Text style={styles.stepSub}>Specify the exact model of your {brand}</Text>

                <View style={{ marginTop: 24 }}>
                  <Input
                    label="Model Name"
                    placeholder="e.g. Activa 6G, Pulsar 150, Swift, Nexon"
                    value={model}
                    onChangeText={setModel}
                    autoFocus
                  />
                </View>
              </View>
            )}

            {/* Step 4: Fuel Type */}
            {step === 4 && (
              <View>
                <Text style={styles.stepTitle}>Select Fuel Engine Type</Text>
                <Text style={styles.stepSub}>This helps our mechanics carry matching parts & fluids</Text>

                <View style={{ gap: 12, marginTop: 20 }}>
                  {FUEL_TYPES.map((f) => {
                    const isSelected = fuelType === f.key;
                    return (
                      <TouchableOpacity
                        key={f.key}
                        style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                        onPress={() => setFuelType(f.key)}
                      >
                        <Text style={{ fontSize: 28, marginRight: 14 }}>{f.icon}</Text>
                        <Text style={styles.typeCardTitle}>{f.label}</Text>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Step 5: Details (Reg Number & Year) */}
            {step === 5 && (
              <View>
                <Text style={styles.stepTitle}>Vehicle Number & Year</Text>
                <Text style={styles.stepSub}>Final details to identify your vehicle</Text>

                <View style={{ marginTop: 20 }}>
                  <Input
                    label="Registration Number"
                    placeholder="KA 01 AB 1234"
                    value={registrationNumber}
                    onChangeText={setRegistrationNumber}
                    autoCapitalize="characters"
                    autoFocus
                  />

                  <Input
                    label="Manufacturing Year"
                    placeholder="2022"
                    keyboardType="number-pad"
                    value={year.toString()}
                    onChangeText={(v) => setYear(parseInt(v, 10) || new Date().getFullYear())}
                  />

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setIsDefault(!isDefault)}
                  >
                    <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                      {isDefault && <Text style={{ color: '#FFFFFF', fontSize: 12 }}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Set as default vehicle for all bookings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          </View>

          {/* Action Button */}
          <View style={{ paddingTop: 24 }}>
            {step < 5 ? (
              <Button title="Next Step →" variant="primary" size="lg" onPress={handleNext} />
            ) : (
              <Button
                title="Add Vehicle to Garage"
                variant="primary"
                size="lg"
                loading={addVehicleMutation.isPending}
                onPress={handleFinish}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
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
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  stepSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  typeCardSelected: {
    borderColor: '#1B5E20',
    backgroundColor: '#F0FDF4',
  },
  typeCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  typeCardSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  brandItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  brandItemSelected: {
    borderColor: '#1B5E20',
    backgroundColor: '#E8F5E9',
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  brandTextSelected: {
    color: '#1B5E20',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 12,
  },
});
