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
import { Button, Input, Card, Badge } from '@gearzo/ui';

interface TaskItem {
  id: string;
  title: string;
  done: boolean;
}

export default function MechanicWorkConsoleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'Vehicle 30-Point Diagnostic Scan', done: true },
    { id: '2', title: 'Engine Oil Drain & Fresh Synthetic Refill', done: true },
    { id: '3', title: 'Air & Fuel Filter Cleaning', done: false },
    { id: '4', title: 'Brake Caliper Servicing & Fluid Bleed', done: false },
    { id: '5', title: 'Drive Chain Tensioning & Lube', done: false },
    { id: '6', title: 'Final Road Test & Wash Polish', done: false },
  ]);

  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [extraReason, setExtraReason] = useState('');
  const [addedExtras, setAddedExtras] = useState<{ name: string; price: number }[]>([
    { name: 'Clutch Cable Assembly', price: 380 },
  ]);

  const [photosUploaded, setPhotosUploaded] = useState(2);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const handleAddExtraSubmit = () => {
    if (!extraName || !extraPrice) {
      Alert.alert('Required Fields', 'Please enter part name and price.');
      return;
    }
    setAddedExtras([...addedExtras, { name: extraName, price: parseInt(extraPrice, 10) || 0 }]);
    setShowAddExtraModal(false);
    setExtraName('');
    setExtraPrice('');
    setExtraReason('');
    Alert.alert('Sent to Customer', 'Approval notification sent to the vehicle owner.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Work Console</Text>
        <Badge label="IN PROGRESS" variant="warning" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Checklist */}
        <Text style={styles.sectionHeader}>Service Task Checklist</Text>
        <Card variant="default" style={styles.card}>
          <View style={{ gap: 12 }}>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskRow}
                onPress={() => toggleTask(task.id)}
              >
                <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                  {task.done && <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>✓</Text>}
                </View>
                <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Photo Proof Uploads */}
        <Text style={styles.sectionHeader}>Inspection Photos ({photosUploaded}/4)</Text>
        <Card variant="default" style={styles.card}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={styles.photoThumb}
              onPress={() => setPhotosUploaded((p) => Math.min(4, p + 1))}
            >
              <Text style={{ fontSize: 24 }}>📸</Text>
              <Text style={styles.photoLabel}>Before Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoThumb}
              onPress={() => setPhotosUploaded((p) => Math.min(4, p + 1))}
            >
              <Text style={{ fontSize: 24 }}>📷</Text>
              <Text style={styles.photoLabel}>After Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoThumb}
              onPress={() => setPhotosUploaded((p) => Math.min(4, p + 1))}
            >
              <Text style={{ fontSize: 24 }}>🛢️</Text>
              <Text style={styles.photoLabel}>Oil Can Seal</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Extra Parts & Labor Requests */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>Additional Parts / Repairs</Text>
          <TouchableOpacity onPress={() => setShowAddExtraModal(true)}>
            <Text style={styles.linkAction}>+ Add Extra</Text>
          </TouchableOpacity>
        </View>

        {addedExtras.length > 0 ? (
          <Card variant="default" style={styles.card}>
            {addedExtras.map((ex, i) => (
              <View key={i} style={styles.extraItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.extraTitle}>{ex.name}</Text>
                  <Text style={styles.extraSub}>Customer notified</Text>
                </View>
                <Text style={styles.extraPrice}>+₹{ex.price}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {/* Modal for Adding Extra Part */}
        {showAddExtraModal && (
          <Card variant="elevated" style={styles.extraModalCard}>
            <Text style={styles.modalTitle}>Request Extra Part Replacement</Text>
            <Input
              label="Part / Labor Name *"
              placeholder="e.g. Brake Shoe Set / Throttle Cable"
              value={extraName}
              onChangeText={setExtraName}
            />
            <Input
              label="Price (₹ MRP) *"
              placeholder="350"
              keyboardType="number-pad"
              value={extraPrice}
              onChangeText={setExtraPrice}
            />
            <Input
              label="Reason for Replacement *"
              placeholder="Heavy wear detected, dangerous to ride"
              value={extraReason}
              onChangeText={setExtraReason}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                style={{ flex: 1 }}
                onPress={() => setShowAddExtraModal(false)}
              />
              <Button
                title="Send Approval Request"
                variant="primary"
                size="md"
                style={{ flex: 1 }}
                onPress={handleAddExtraSubmit}
              />
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.bottomBar}>
        <Button
          title="Complete Job & Collect Payment →"
          variant="primary"
          size="lg"
          onPress={() => router.replace(`/job/${id}/complete`)}
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  linkAction: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  taskTitleDone: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  photoThumb: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 4,
  },
  extraItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extraTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  extraSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
  },
  extraPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B5E20',
  },
  extraModalCard: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
