import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

interface Zone {
  id: string;
  name: string;
  city: string;
  activeMechanics: number;
  surgeMultiplier: number;
  status: 'ACTIVE' | 'PAUSED';
}

export default function JurisdictionsScreen() {
  const router = useRouter();

  const [zones, setZones] = useState<Zone[]>([
    {
      id: 'zone-blr-east',
      name: 'Bengaluru East (Whitefield, Bellandur, Marathahalli)',
      city: 'Bengaluru',
      activeMechanics: 28,
      surgeMultiplier: 1.0,
      status: 'ACTIVE',
    },
    {
      id: 'zone-blr-south',
      name: 'Bengaluru South (Koramangala, HSR Layout, BTM)',
      city: 'Bengaluru',
      activeMechanics: 34,
      surgeMultiplier: 1.2,
      status: 'ACTIVE',
    },
    {
      id: 'zone-blr-central',
      name: 'Bengaluru Central (Indiranagar, MG Road, CBD)',
      city: 'Bengaluru',
      activeMechanics: 16,
      surgeMultiplier: 1.0,
      status: 'ACTIVE',
    },
    {
      id: 'zone-hyd-hitech',
      name: 'Hyderabad HITEC City & Gachibowli',
      city: 'Hyderabad',
      activeMechanics: 12,
      surgeMultiplier: 1.0,
      status: 'PAUSED',
    },
  ]);

  const toggleZone = (id: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, status: z.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : z))
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Operating Jurisdictions & Geofences</Text>
          <Text style={styles.sub}>PostGIS Polygon Geofence Zones & Hyperlocal Dispatch Regions</Text>
        </View>

        <Button
          title="+ Add Service Zone"
          variant="primary"
          size="sm"
          onPress={() => Alert.alert('Zone Editor', 'Polygon geoJSON map editor')}
        />
      </View>

      <FlatList
        data={zones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.zoneName}>{item.name}</Text>
                  <Badge
                    label={item.status}
                    variant={item.status === 'ACTIVE' ? 'success' : 'neutral'}
                  />
                </View>
                <Text style={styles.city}>{item.city} • {item.activeMechanics} mechanics online</Text>
              </View>

              <TouchableOpacity
                style={[styles.toggleBtn, item.status === 'ACTIVE' ? styles.pauseBtn : styles.resumeBtn]}
                onPress={() => toggleZone(item.id)}
              >
                <Text style={styles.toggleText}>
                  {item.status === 'ACTIVE' ? 'Pause Zone' : 'Activate Zone'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.surgeText}>
                Surge Multiplier: <Text style={{ fontWeight: '800' }}>{item.surgeMultiplier}x</Text>
              </Text>
              <Text style={styles.polygonRef}>GeoJSON: PostGIS Polygon (4326)</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  city: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pauseBtn: {
    backgroundColor: '#FEF2F2',
  },
  resumeBtn: {
    backgroundColor: '#DCFCE7',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  surgeText: {
    fontSize: 12,
    color: '#334155',
  },
  polygonRef: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
