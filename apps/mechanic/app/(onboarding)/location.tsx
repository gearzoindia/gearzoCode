import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';
import { useSaveMechanicLocation } from '@gearzo/api-client';

const RADIUS_OPTIONS = [3, 5, 10, 15];

export default function OnboardingLocationScreen() {
  const router = useRouter();

  const [address, setAddress] = useState(
    'Shop No. 12, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038'
  );
  const [radiusKm, setRadiusKm] = useState<number>(5);

  const saveLocationMutation = useSaveMechanicLocation();

  const handleContinue = async () => {
    try {
      await saveLocationMutation.mutateAsync({
        address,
        latitude: 12.9716,
        longitude: 77.5946,
        radiusKm,
      });
    } catch {
      // Proceed
    }

    router.push('/(onboarding)/kyc');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: '64%' }]} />
        </View>
        <Text style={styles.stepCount}>Step 4 of 6: Base Location & Radius</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.title}>Service Operating Area</Text>
          <Text style={styles.subtitle}>
            Set your garage or home base. You will only receive job dispatch offers within your selected operating radius.
          </Text>

          {/* Map Simulation Box */}
          <View style={styles.mapBox}>
            <View style={[styles.radiusCircle, { width: radiusKm * 20, height: radiusKm * 20 }]}>
              <View style={styles.pin}>
                <Text style={{ fontSize: 24 }}>📍</Text>
              </View>
            </View>
            <View style={styles.mapWatermark}>
              <Text style={styles.mapWatermarkText}>Operating Radius: {radiusKm} km</Text>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Input
              label="Base Address / Workshop Location"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />

            <Text style={styles.label}>Select Service Radius (Distance from Base)</Text>
            <View style={styles.radiusRow}>
              {RADIUS_OPTIONS.map((r) => {
                const isSelected = radiusKm === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.radiusBtn, isSelected && styles.radiusBtnActive]}
                    onPress={() => setRadiusKm(r)}
                  >
                    <Text style={[styles.radiusText, isSelected && styles.radiusTextActive]}>
                      {r} km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.radiusNote}>
              💡 5 km is recommended to ensure quick 20-30 min arrival times and lower commute strain.
            </Text>
          </View>
        </View>

        <View style={{ paddingTop: 24 }}>
          <Button
            title="Continue to KYC Documents →"
            variant="primary"
            size="lg"
            loading={saveLocationMutation.isPending}
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
    lineHeight: 20,
  },
  mapBox: {
    height: 180,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radiusCircle: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#1B5E20',
    backgroundColor: 'rgba(27, 94, 32, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapWatermark: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mapWatermarkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B5E20',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 8,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  radiusBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  radiusBtnActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  radiusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  radiusTextActive: {
    color: '#FFFFFF',
  },
  radiusNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    lineHeight: 16,
  },
});
