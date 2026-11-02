import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Button, Input, GearzoMap, reverseGeocodeGoogle } from '@gearzo/ui';
import { useSaveMechanicLocation } from '@gearzo/api-client';

const RADIUS_OPTIONS = [3, 5, 10, 15];

export default function OnboardingLocationScreen() {
  const router = useRouter();

  const [address, setAddress] = useState(
    'Shop No. 12, 100 Feet Road, Madhapur, Hyderabad, Telangana 500081'
  );
  const [coords, setCoords] = useState({ latitude: 17.4485, longitude: 78.3908 });
  const [radiusKm, setRadiusKm] = useState<number>(5);

  const saveLocationMutation = useSaveMechanicLocation();

  const handleSelectCoord = async (newCoord: { latitude: number; longitude: number }) => {
    setCoords(newCoord);
    const geo = await reverseGeocodeGoogle(newCoord.latitude, newCoord.longitude);
    if (geo && geo.formattedAddress) {
      setAddress(geo.formattedAddress);
      return;
    }
    try {
      const nativeGeo = await Location.reverseGeocodeAsync(newCoord);
      if (nativeGeo && nativeGeo.length > 0) {
        const g = nativeGeo[0];
        const formatted = [g.name, g.street, g.district, g.city, g.region, g.postalCode]
          .filter(Boolean)
          .join(', ');
        if (formatted) setAddress(formatted);
      }
    } catch {
      // Ignore fallback error
    }
  };

  const handleUseCurrentGps = async (silent = false) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!silent) {
          Alert.alert('Permission Needed', 'Please allow location permission to set your workshop base.');
        }
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await handleSelectCoord({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch {
      if (!silent) {
        Alert.alert('GPS Notice', 'Tap anywhere on the Google Map to position your workshop pin.');
      }
    }
  };

  useEffect(() => {
    handleUseCurrentGps(true);
  }, []);

  const handleContinue = async () => {
    try {
      await saveLocationMutation.mutateAsync({
        address,
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm,
      });
    } catch {
      // Proceed
    }

    router.push('/(onboarding)/kyc');
  };

  const zoomDelta = radiusKm <= 3 ? 0.06 : radiusKm <= 5 ? 0.1 : radiusKm <= 10 ? 0.2 : 0.3;

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
            Set your garage or home base on Google Maps. You will receive job dispatch offers within your selected operating radius.
          </Text>

          {/* Interactive Google Map with Service Radius Circle */}
          <View style={styles.mapBox}>
            <GearzoMap
              latitude={coords.latitude}
              longitude={coords.longitude}
              zoomDelta={zoomDelta}
              radiusMeters={radiusKm * 1000}
              onLocationSelect={handleSelectCoord}
              style={StyleSheet.absoluteFillObject}
              markers={[
                {
                  id: 'selected',
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  title: 'Workshop / Base Location',
                  badgeText: `${radiusKm} km Zone`,
                  iconText: '🔧',
                  color: '#1B5E20',
                },
              ]}
            />
            <TouchableOpacity style={styles.gpsFloatingBtn} onPress={() => handleUseCurrentGps(false)}>
              <Text style={styles.gpsBtnText}>🎯 Use GPS</Text>
            </TouchableOpacity>
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
    height: 220,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    marginTop: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  gpsFloatingBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1B5E20',
    elevation: 3,
  },
  gpsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B5E20',
  },
  mapWatermark: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
