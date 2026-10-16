import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@gearzo/ui';
import { useUpdateJobStep } from '@gearzo/api-client';

export default function MechanicNavigateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const updateStepMutation = useUpdateJobStep();

  const handleOpenGoogleMaps = () => {
    Linking.openURL('https://maps.google.com/?q=12.9698,77.7499');
  };

  const handleArrived = async () => {
    try {
      await updateStepMutation.mutateAsync({
        jobId: id || 'current',
        step: 'ARRIVED',
      });
    } catch {
      // Proceed
    }
    router.replace(`/job/${id}/start`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigation to Customer</Text>
        <TouchableOpacity onPress={handleOpenGoogleMaps} style={styles.backBtn}>
          <Text style={{ fontSize: 18 }}>🗺️</Text>
        </TouchableOpacity>
      </View>

      {/* Map Simulation Canvas */}
      <View style={styles.mapCanvas}>
        <View style={styles.routeOverlay}>
          <Text style={{ fontSize: 32 }}>🏍️ 💨 💨 🏠</Text>
        </View>

        <View style={styles.turnCard}>
          <Text style={styles.turnIcon}>↱</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.turnDistance}>In 250 meters</Text>
            <Text style={styles.turnInstruction}>Turn right onto Palm Meadows Main Ave</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet Details */}
      <View style={styles.bottomSheet}>
        <Card variant="elevated" style={styles.infoCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.etaText}>1.8 km • 6 mins away</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                Villa 14, Palm Meadows, Whitefield
              </Text>
            </View>
            <TouchableOpacity style={styles.callCircle} onPress={() => Linking.openURL('tel:+919876543210')}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Button
          title="I Have Arrived at Doorstep ✓"
          variant="primary"
          size="lg"
          loading={updateStepMutation.isPending}
          onPress={handleArrived}
        />
      </View>
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
  mapCanvas: {
    flex: 1,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  routeOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 4,
  },
  turnCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  turnIcon: {
    fontSize: 28,
    color: '#38BDF8',
    fontWeight: '800',
  },
  turnDistance: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  turnInstruction: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  bottomSheet: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  etaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
  },
  addressText: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  callCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
