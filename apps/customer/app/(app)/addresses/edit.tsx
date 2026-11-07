import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Button, Input, GearzoMap, reverseGeocodeGoogle } from '@gearzo/ui';
import { useCreateAddress } from '@gearzo/api-client';

export default function EditAddressModal() {
  const router = useRouter();
  const createAddressMutation = useCreateAddress();

  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('Madhapur, Hitec City');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('500081');
  const [coords, setCoords] = useState({ latitude: 17.4485, longitude: 78.3908 });
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePinSelect = async (newCoord: { latitude: number; longitude: number }) => {
    setCoords(newCoord);
    const geo = await reverseGeocodeGoogle(newCoord.latitude, newCoord.longitude);
    if (geo) {
      if (geo.area) setArea(geo.area);
      if (geo.city) setCity(geo.city);
      if (geo.pincode) setPincode(geo.pincode);
      return;
    }
    try {
      const nativeGeo = await Location.reverseGeocodeAsync(newCoord);
      if (nativeGeo && nativeGeo.length > 0) {
        const g = nativeGeo[0];
        if (g.district || g.street || g.name) {
          setArea([g.street, g.district || g.subregion].filter(Boolean).join(', '));
        }
        if (g.city) setCity(g.city);
        if (g.postalCode) setPincode(g.postalCode);
      }
    } catch {
      // Ignore fallback error
    }
  };

  const handleUseCurrentLocation = async (silent = false) => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!silent) {
          Alert.alert('Permission Needed', 'Please allow location access to detect your doorstep pin.');
        }
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await handlePinSelect({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch {
      if (!silent) {
        Alert.alert('Location Notice', 'Could not fetch GPS fix. You can tap anywhere on the map to set your pin.');
      }
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    handleUseCurrentLocation(true);
  }, []);

  const handleSave = async () => {
    if (!flat.trim() || !area.trim()) {
      Alert.alert('Required Fields', 'Please enter your house/flat number and street area.');
      return;
    }
    try {
      setIsSaving(true);
      await createAddressMutation.mutateAsync({
        label: tag.toUpperCase(),
        line1: flat.trim(),
        line2: `${area.trim()}, ${city.trim()}${pincode ? ` - ${pincode.trim()}` : ''}`,
        landmark: landmark.trim() || undefined,
        lat: coords.latitude,
        lng: coords.longitude,
        isDefault: true,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Save Failed', err?.response?.data?.message || err?.message || 'Unable to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Interactive Google Map Pin Picker */}
        <View style={styles.mapContainer}>
          <GearzoMap
            latitude={coords.latitude}
            longitude={coords.longitude}
            zoomDelta={0.012}
            onLocationSelect={handlePinSelect}
            markers={[
              {
                id: 'selected',
                latitude: coords.latitude,
                longitude: coords.longitude,
                title: 'Service Doorstep Location',
                badgeText: 'Doorstep Pin',
                iconText: '📍',
                color: '#16A34A',
              },
            ]}
          />
          <TouchableOpacity
            style={styles.gpsFloatingBtn}
            onPress={() => handleUseCurrentLocation(false)}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <Text style={styles.gpsBtnText}>🎯 Use Current GPS</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.mapHint}>
          Tap on the Google Map to move your doorstep pin ({coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)})
        </Text>

        {/* Tag Selector */}
        <Text style={styles.label}>Address Label</Text>
        <View style={styles.tagRow}>
          {(['Home', 'Work', 'Other'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tagBtn, tag === t && styles.tagBtnActive]}
              onPress={() => setTag(t)}
            >
              <Text style={[styles.tagBtnText, tag === t && styles.tagBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="House / Flat / Block No."
          placeholder="e.g. Flat 402, Building A"
          value={flat}
          onChangeText={setFlat}
        />

        <Input
          label="Street / Area / Locality"
          placeholder="e.g. Madhapur / Hitec City"
          value={area}
          onChangeText={setArea}
        />

        <Input
          label="Landmark (Optional)"
          placeholder="e.g. Near Metro Pillar 12"
          value={landmark}
          onChangeText={setLandmark}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="City"
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Pincode"
              placeholder="500081"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Button
          title={isSaving ? 'Saving...' : 'Save Address'}
          variant="primary"
          size="lg"
          onPress={handleSave}
          disabled={isSaving}
          style={{ marginTop: 24 }}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  mapContainer: {
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    position: 'relative',
  },
  gpsFloatingBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#16A34A',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  mapHint: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tagBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tagBtnActive: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  tagBtnText: {
    fontSize: 14,
    color: '#4B5563',
  },
  tagBtnTextActive: {
    color: '#16A34A',
    fontWeight: '700',
  },
});
