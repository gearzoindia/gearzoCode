import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@gearzo/ui';

export default function EditAddressModal() {
  const router = useRouter();

  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');

  const handleSave = () => {
    // Save address
    router.back();
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
          placeholder="e.g. Green Glen Layout, Bellandur"
          value={area}
          onChangeText={setArea}
        />

        <Input
          label="Landmark (Optional)"
          placeholder="e.g. Near Sobha Iris / Behind HP Petrol Pump"
          value={landmark}
          onChangeText={setLandmark}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Input label="City" value={city} onChangeText={setCity} />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Pincode"
              placeholder="560103"
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
        </View>

        <Button
          title="Save Address"
          variant="primary"
          size="lg"
          onPress={handleSave}
          style={{ marginTop: 20 }}
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
    gap: 12,
    marginBottom: 20,
  },
  tagBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  tagBtnActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  tagBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  tagBtnTextActive: {
    color: '#1B5E20',
  },
});
