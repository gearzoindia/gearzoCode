import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@gearzo/ui';
import { useCancelBooking } from '@gearzo/api-client';

export default function SearchingMechanicScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const cancelMutation = useCancelBooking();

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        // After 4 seconds, simulate match found
        if (prev >= 4) {
          clearInterval(timer);
          router.replace(`/booking/${id}/track`);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [id]);

  const handleCancelSearch = () => {
    Alert.alert('Cancel Search', 'Are you sure you want to cancel the mechanic search?', [
      { text: 'Wait', style: 'cancel' },
      {
        text: 'Cancel Request',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation.mutateAsync({
              bookingId: id || 'current',
              reason: 'Customer cancelled during search',
            });
          } catch {
            // navigate back anyway
          }
          router.replace('/(app)/(tabs)');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {/* Radar Pulse Effect */}
        <View style={styles.radarOuter}>
          <View style={styles.radarMid}>
            <View style={styles.radarCenter}>
              <Text style={{ fontSize: 36 }}>🔧</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Finding Nearest Mechanic</Text>
        <Text style={styles.subtitle}>
          Broadcasting your request to top-rated certified mechanics within 5 km of your location...
        </Text>

        <View style={styles.statusBox}>
          <ActivityIndicator color="#1B5E20" size="small" style={{ marginRight: 8 }} />
          <Text style={styles.statusText}>Searching available technicians ({secondsElapsed}s)</Text>
        </View>

        <View style={{ width: '100%', marginTop: 40 }}>
          <Button
            title="Cancel Search"
            variant="ghost"
            size="md"
            textStyle={{ color: '#DC2626' }}
            loading={cancelMutation.isPending}
            onPress={handleCancelSearch}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  radarOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  radarMid: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
});
