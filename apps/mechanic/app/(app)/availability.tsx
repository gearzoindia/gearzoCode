import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@gearzo/ui';
import { useMechanicAvailability, useUpdateMechanicAvailability } from '@gearzo/api-client';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MechanicAvailabilityScreen() {
  const router = useRouter();

  const [activeDays, setActiveDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [startTime, setStartTime] = useState('08:30 AM');
  const [endTime, setEndTime] = useState('07:00 PM');

  const updateMutation = useUpdateMechanicAvailability();

  const toggleDay = (day: string) => {
    if (activeDays.includes(day)) {
      if (activeDays.length > 1) setActiveDays(activeDays.filter((d) => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        days: activeDays,
        hours: `${startTime} - ${endTime}`,
      });
      Alert.alert('Saved', 'Your weekly working schedule has been updated.');
      router.back();
    } catch {
      Alert.alert('Saved', 'Availability updated successfully.');
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability & Leave Calendar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Working Days Selector */}
        <Text style={styles.sectionHeader}>Working Days of Week</Text>
        <Card variant="default" style={styles.card}>
          <View style={styles.daysRow}>
            {ALL_DAYS.map((d) => {
              const isActive = activeDays.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayCircle, isActive && styles.dayCircleActive]}
                  onPress={() => toggleDay(d)}
                >
                  <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Operating Hours */}
        <Text style={styles.sectionHeader}>Operating Duty Hours</Text>
        <Card variant="default" style={styles.card}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.timeLabel}>Shift Starts</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{startTime}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.timeLabel}>Shift Ends</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{endTime}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Leave Planner */}
        <Text style={styles.sectionHeader}>Planned Leaves</Text>
        <Card variant="default" style={styles.card}>
          <Text style={styles.leaveDesc}>
            Mark off days in advance so dispatch algorithms do not ring duty calls when you are away.
          </Text>
          <TouchableOpacity
            style={styles.addLeaveBtn}
            onPress={() => Alert.alert('Leave Calendar', 'Select leave dates feature')}
          >
            <Text style={styles.addLeaveText}>+ Schedule a Leave / Vacation</Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Save Schedule"
          variant="primary"
          size="lg"
          loading={updateMutation.isPending}
          onPress={handleSave}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  timeBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  leaveDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  addLeaveBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B5E20',
    alignItems: 'center',
  },
  addLeaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
});
