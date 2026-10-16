import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

const DATA_TYPES = ['Bookings & Invoices', 'Mechanic Attendance & Payouts', 'Customer Directory', 'Dispute Logs'];

export default function ReportsExportsScreen() {
  const router = useRouter();

  const [dataType, setDataType] = useState(DATA_TYPES[0]);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-13');

  const handleDownload = () => {
    Alert.alert('CSV Generation Started', `Exporting "${dataType}" for period ${startDate} to ${endDate}. File download will begin shortly.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Platform Data (CSV)</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.label}>Select Export Dataset</Text>
          <View style={styles.chipRow}>
            {DATA_TYPES.map((dt) => {
              const isSelected = dataType === dt;
              return (
                <TouchableOpacity
                  key={dt}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setDataType(dt)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{dt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Input label="Start Date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="End Date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
            </View>
          </View>

          <Button
            title="Generate & Download CSV"
            variant="primary"
            size="lg"
            onPress={handleDownload}
            style={{ marginTop: 12 }}
          />
        </Card>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
