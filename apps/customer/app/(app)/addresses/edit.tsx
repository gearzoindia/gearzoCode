import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@gearzo/ui';
import { useCreateAddress } from '@gearzo/api-client';

export default function EditAddressModal() {
  const router = useRouter();
  const createAddressMutation = useCreateAddress();

  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
        lat: 17.4485,
        lng: 78.3756,
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

      <ScrollView contentContainerStyle={{ padding: 20 }}>
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
