import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';

interface ChecklistItem {
  id: string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
}

export default function ServiceProgressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', title: 'Vehicle 30-Point Inspection', status: 'COMPLETED' },
    { id: '2', title: 'Engine Oil Flush & Refill', status: 'COMPLETED' },
    { id: '3', title: 'Air & Fuel Filter Cleaning', status: 'IN_PROGRESS' },
    { id: '4', title: 'Brake Caliper Servicing', status: 'PENDING' },
    { id: '5', title: 'Chain Tension & Lube', status: 'PENDING' },
    { id: '6', title: 'Final Road Test & Wash', status: 'PENDING' },
  ]);

  const [extraItem, setExtraItem] = useState<{
    id: string;
    partName: string;
    pricePaise: number;
    reason: string;
    approved: boolean | null;
  } | null>({
    id: 'extra-1',
    partName: 'Clutch Cable Assembly',
    pricePaise: 38000,
    reason: 'Heavy fraying detected near clutch lever. Risk of breakdown.',
    approved: null,
  });

  const handleApproveExtra = () => {
    if (extraItem) {
      setExtraItem({ ...extraItem, approved: true });
      Alert.alert('Approved', 'Added to final invoice with 30-day parts warranty.');
    }
  };

  const handleDeclineExtra = () => {
    if (extraItem) {
      setExtraItem({ ...extraItem, approved: false });
      Alert.alert('Declined', 'The extra repair request has been skipped.');
    }
  };

  const handleFinishService = () => {
    // Navigate to invoice
    router.replace(`/booking/${id}/invoice`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Service Progress</Text>
        <Badge label="IN PROGRESS" variant="warning" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Status Banner */}
        <Card variant="elevated" style={styles.statusCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>⚙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Technician at Work</Text>
              <Text style={styles.statusSub}>
                Ramesh Kumar is actively executing service steps on your vehicle
              </Text>
            </View>
          </View>
        </Card>

        {/* Extra Parts Approval Card (if any pending) */}
        {extraItem && extraItem.approved === null && (
          <Card variant="default" style={styles.approvalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge label="ACTION REQUIRED" variant="error" />
              <Text style={styles.extraPrice}>
                +₹{(extraItem.pricePaise / 100).toLocaleString('en-IN')}
              </Text>
            </View>

            <Text style={styles.extraTitle}>Additional Part Recommended</Text>
            <Text style={styles.extraName}>{extraItem.partName}</Text>
            <Text style={styles.extraReason}>{extraItem.reason}</Text>

            <View style={styles.approvalBtnRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDeclineExtra}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={handleApproveExtra}>
                <Text style={styles.approveText}>Approve & Replace</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {extraItem && extraItem.approved === true && (
          <Card variant="default" style={[styles.approvalCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Text style={{ fontSize: 13, color: '#166534', fontWeight: '700' }}>
              ✓ Approved Extra: {extraItem.partName} (+₹{(extraItem.pricePaise / 100).toLocaleString('en-IN')})
            </Text>
          </Card>
        )}

        {/* Live Service Checklist */}
        <Text style={styles.sectionHeader}>Service Checklist</Text>
        <Card variant="default" style={{ padding: 16, borderRadius: 12 }}>
          <View style={{ gap: 14 }}>
            {checklist.map((item, index) => {
              const isDone = item.status === 'COMPLETED';
              const isInProgress = item.status === 'IN_PROGRESS';
              return (
                <View key={item.id} style={styles.checkRow}>
                  <View
                    style={[
                      styles.checkBadge,
                      isDone && styles.checkBadgeDone,
                      isInProgress && styles.checkBadgeActive,
                    ]}
                  >
                    <Text style={styles.checkBadgeText}>
                      {isDone ? '✓' : isInProgress ? '⏳' : `${index + 1}`}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.checkTitle,
                        isDone && { color: '#6B7280', textDecorationLine: 'line-through' },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.checkSub}>
                      {isDone
                        ? 'Inspection complete & verified'
                        : isInProgress
                        ? 'Technician currently working'
                        : 'Awaiting turn'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Simulation Button */}
        <View style={{ marginTop: 24 }}>
          <Button
            title="Simulate Service Complete → View Invoice"
            variant="primary"
            size="lg"
            onPress={handleFinishService}
          />
        </View>
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
  statusCard: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statusSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  approvalCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  extraPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B91C1C',
  },
  extraTitle: {
    fontSize: 12,
    color: '#7F1D1D',
    fontWeight: '600',
    marginTop: 8,
  },
  extraName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  extraReason: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 18,
  },
  approvalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  declineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  approveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
  },
  approveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkBadgeDone: {
    backgroundColor: '#DCFCE7',
  },
  checkBadgeActive: {
    backgroundColor: '#FEF3C7',
  },
  checkBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  checkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  checkSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
});
