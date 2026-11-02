import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Button, Card, LoadingScreen, GearzoMap } from '@gearzo/ui';
import { useUpdateJobStep, useMechanicJobDetail } from '@gearzo/api-client';

export default function MechanicNavigateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: job, isLoading } = useMechanicJobDetail(id || '');
  const updateStepMutation = useUpdateJobStep();

  const destLat = Number(job?.latitude || 17.4485);
  const destLng = Number(job?.longitude || 78.3908);
  const [mechCoords, setMechCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || !mounted) return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) {
          setMechCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 20 },
          (loc) => {
            if (mounted) {
              setMechCoords({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
          }
        );
      } catch {
        // Fallback to simulated offset
      }
    })();
    return () => {
      mounted = false;
      if (sub) sub.remove();
    };
  }, []);

  const mechLat = mechCoords?.latitude ?? destLat - 0.008;
  const mechLng = mechCoords?.longitude ?? destLng - 0.011;

  const handleOpenGoogleMaps = () => {
    if (job?.latitude && job?.longitude) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`);
    } else if (job?.address) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}`);
    } else {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`);
    }
  };

  const handleCall = () => {
    const phone = (job as any)?.customer?.phone || (job as any)?.customerPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleArrived = async () => {
    try {
      await updateStepMutation.mutateAsync({
        jobId: id || '',
        step: 'ARRIVED',
      });
    } catch {
      // Proceed
    }
    router.replace(`/job/${id}/start`);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Navigation..." />;
  }

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

      {/* Live Google Map Canvas */}
      <View style={styles.mapCanvas}>
        <GearzoMap
          latitude={(destLat + mechLat) / 2}
          longitude={(destLng + mechLng) / 2}
          zoomDelta={0.025}
          style={StyleSheet.absoluteFillObject}
          routeCoordinates={[
            { latitude: mechLat, longitude: mechLng },
            { latitude: (destLat + mechLat) / 2 + 0.001, longitude: (destLng + mechLng) / 2 },
            { latitude: destLat, longitude: destLng },
          ]}
          markers={[
            {
              id: 'mechanic-pos',
              latitude: mechLat,
              longitude: mechLng,
              title: 'Your Position',
              badgeText: 'You (Mechanic)',
              iconText: '🏍️',
              color: '#0B4A27',
            },
            {
              id: 'customer-dest',
              latitude: destLat,
              longitude: destLng,
              title: job?.address || 'Customer Location',
              badgeText: 'Customer Doorstep',
              iconText: '📍',
              color: '#16A34A',
            },
          ]}
        />

        <View style={styles.turnCard}>
          <Text style={styles.turnIcon}>📍</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.turnDistance}>{job?.vehicleSummary || 'Service Order'}</Text>
            <Text style={styles.turnInstruction} numberOfLines={2}>
              {job?.address || 'Customer destination'}
            </Text>
          </View>
          <TouchableOpacity style={styles.openGmapsBtn} onPress={handleOpenGoogleMaps}>
            <Text style={styles.openGmapsText}>Open Maps ↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Details */}
      <View style={styles.bottomSheet}>
        <Card variant="elevated" style={styles.infoCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.etaText}>Destination Address</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {job?.address || 'Address provided by customer'}
              </Text>
            </View>
            <TouchableOpacity style={styles.callCircle} onPress={handleCall}>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  turnCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  turnIcon: {
    fontSize: 22,
    color: '#22C55E',
  },
  turnDistance: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  turnInstruction: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  openGmapsBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  openGmapsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomSheet: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  infoCard: {
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  etaText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
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
