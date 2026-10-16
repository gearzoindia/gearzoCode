import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

interface AddressItem {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  addressLine: string;
  landmark?: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 'addr-1',
      tag: 'Home',
      addressLine: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
      landmark: 'Near Sobha Iris',
      isDefault: true,
    },
    {
      id: 'addr-2',
      tag: 'Work',
      addressLine: 'Building 4B, Ecospace Business Park, Outer Ring Road, Bengaluru 560103',
      landmark: 'Tower B, 3rd Floor',
      isDefault: false,
    },
  ]);

  const handleMakeDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => router.push('/addresses/edit')} style={styles.backBtn}>
          <Text style={{ fontSize: 20, color: '#1B5E20' }}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18 }}>{item.tag === 'Home' ? '🏠' : '🏢'}</Text>
                <Text style={styles.tagText}>{item.tag}</Text>
                {item.isDefault && <Badge label="Default" variant="success" />}
              </View>

              {!item.isDefault && (
                <TouchableOpacity onPress={() => handleMakeDefault(item.id)}>
                  <Text style={styles.makeDefaultText}>Set as Default</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.addressLine}>{item.addressLine}</Text>
            {item.landmark ? (
              <Text style={styles.landmark}>Landmark: {item.landmark}</Text>
            ) : null}
          </Card>
        )}
      />

      <View style={styles.bottomBar}>
        <Button
          title="+ Add New Address"
          variant="primary"
          size="lg"
          onPress={() => router.push('/addresses/edit')}
        />
      </View>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  makeDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B5E20',
  },
  addressLine: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginTop: 8,
  },
  landmark: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
