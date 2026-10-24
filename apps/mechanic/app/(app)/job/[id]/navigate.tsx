import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, LoadingScreen } from '@gearzo/ui';
import { useUpdateJobStep, useMechanicJobDetail } from '@gearzo/api-client';

export default function MechanicNavigateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: job, isLoading } = useMechanicJobDetail(id || '');
  const updateStepMutation = useUpdateJobStep();

  const handleOpenGoogleMaps = () => {
    if (job?.latitude && job?.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${job.latitude},${job.longitude}`);
    } else if (job?.address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(job.address)}`);
    } else {
      Linking.openURL('https://maps.google.com');
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

      {/* Map Canvas */}
      <View style={styles.mapCanvas}>
        <View style={styles.routeOverlay}>
          <Text style={{ fontSize: 32 }}>🏍️ 💨 💨 🏠</Text>
        </View>

        <View style={styles.turnCard}>
          <Text style={styles.turnIcon}>📍</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.turnDistance}>{job?.vehicleSummary || 'Service Order'}</Text>
            <Text style={styles.turnInstruction} numberOfLines={2}>
              {job?.address || 'Customer destination'}
            </Text>
          </View>
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
  routeOverlay: {
    alignItems: 'center',
  },
  turnCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnIcon: {
    fontSize: 24,
    color: '#22C55E',
  },
  turnDistance: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  turnInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
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
