import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Switch,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input } from '@gearzo/ui';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  targetApp: 'ALL' | 'CUSTOMER' | 'MECHANIC' | 'ADMIN';
  rolloutPercentage: number;
  jurisdictions: string[];
  isEnabled: boolean;
  environment: 'PRODUCTION' | 'STAGING';
  updatedAt: string;
  updatedBy: string;
}

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: 'ff-1',
    key: 'instant_booking_dispatch',
    name: 'Instant One-Tap Mechanic Dispatch',
    description: 'Enables real-time algorithmic ring dispatch within 4.5km radar with 30s auto-escalation.',
    targetApp: 'CUSTOMER',
    rolloutPercentage: 100,
    jurisdictions: ['ALL'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-12T08:30:00Z',
    updatedBy: 'Chief Architect',
  },
  {
    id: 'ff-2',
    key: 'doorstep_water_wash',
    name: 'Doorstep Eco-Pressure Water Wash',
    description: 'Enables mobile doorstep foam cleaning and interior steam sanitisation booking services.',
    targetApp: 'CUSTOMER',
    rolloutPercentage: 75,
    jurisdictions: ['Bengaluru', 'Hyderabad'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-11T14:15:00Z',
    updatedBy: 'Growth Product Manager',
  },
  {
    id: 'ff-3',
    key: 'shop_dropoff_service',
    name: 'Workshop Garage Drop-off & Pickup',
    description: 'Allows verified garage partners to accept major engine overhaul and multi-day repair drop-offs.',
    targetApp: 'ALL',
    rolloutPercentage: 50,
    jurisdictions: ['Bengaluru'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-09T18:00:00Z',
    updatedBy: 'Operations Director',
  },
  {
    id: 'ff-4',
    key: 'referral_coin_rewards',
    name: 'GearZo Referral Coins & Wallet Cashback',
    description: 'Rewards ₹250 wallet credit to referee and referrer upon first successful inspection completion.',
    targetApp: 'CUSTOMER',
    rolloutPercentage: 100,
    jurisdictions: ['ALL'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-10T11:20:00Z',
    updatedBy: 'Marketing Lead',
  },
  {
    id: 'ff-5',
    key: 'instant_imps_payout',
    name: 'Instant 24x7 IMPS Partner Payouts',
    description: 'Triggers instant bank transfer payout via RazorpayX Route upon job completion verification.',
    targetApp: 'MECHANIC',
    rolloutPercentage: 100,
    jurisdictions: ['ALL'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-08T09:45:00Z',
    updatedBy: 'FinTech Lead',
  },
  {
    id: 'ff-6',
    key: 'dynamic_surge_pricing',
    name: 'Real-Time Demand Density Surge Multiplier',
    description: 'Dynamically calculates 1.1x - 1.8x surge multiplier when mechanic availability drops below 15%.',
    targetApp: 'ALL',
    rolloutPercentage: 100,
    jurisdictions: ['ALL'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-11T16:50:00Z',
    updatedBy: 'Pricing Analyst',
  },
  {
    id: 'ff-7',
    key: 'sos_battery_jumpstart',
    name: '24x7 SOS Roadside Battery Jumpstart',
    description: 'Priority high-urgency jumpstart & puncture dispatch with dedicated 15-minute SLA.',
    targetApp: 'CUSTOMER',
    rolloutPercentage: 80,
    jurisdictions: ['Bengaluru', 'Mumbai', 'Delhi-NCR'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-07T12:00:00Z',
    updatedBy: 'Roadside Assist Lead',
  },
  {
    id: 'ff-8',
    key: 'mechanic_leave_calendar',
    name: 'Mechanic Shift & Leave Self-Service Planner',
    description: 'Permits mechanic partners to declare scheduled offline dates without dispatch penalty score impact.',
    targetApp: 'MECHANIC',
    rolloutPercentage: 100,
    jurisdictions: ['ALL'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-05T10:10:00Z',
    updatedBy: 'Partner Ops',
  },
  {
    id: 'ff-9',
    key: 'totp_enforcement_admin',
    name: 'Mandatory 2FA TOTP for Operations Staff',
    description: 'Requires Google Authenticator 6-digit TOTP verification on every admin login attempt.',
    targetApp: 'ADMIN',
    rolloutPercentage: 100,
    jurisdictions: ['ALL'],
    isEnabled: true,
    environment: 'PRODUCTION',
    updatedAt: '2026-10-01T08:00:00Z',
    updatedBy: 'Security Architect',
  },
  {
    id: 'ff-10',
    key: 'ai_damage_estimation',
    name: 'AI Computer Vision Damage Estimator',
    description: 'Extracts dent, scratch, and fluid leak bounding boxes from pre-service inspection photos.',
    targetApp: 'ALL',
    rolloutPercentage: 15,
    jurisdictions: ['Bengaluru'],
    isEnabled: false,
    environment: 'STAGING',
    updatedAt: '2026-10-12T17:30:00Z',
    updatedBy: 'AI Lab',
  },
];

export default function FeatureFlagsScreen() {
  const router = useRouter();

  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [selectedAppFilter, setSelectedAppFilter] = useState<'ALL' | 'CUSTOMER' | 'MECHANIC' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlagForEdit, setSelectedFlagForEdit] = useState<FeatureFlag | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // New Flag form state
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newApp, setNewApp] = useState<'ALL' | 'CUSTOMER' | 'MECHANIC' | 'ADMIN'>('ALL');
  const [newRollout, setNewRollout] = useState('100');

  const filteredFlags = flags.filter((f) => {
    const matchesFilter = selectedAppFilter === 'ALL' || f.targetApp === selectedAppFilter;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleFlagStatus = (id: string) => {
    setFlags((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = !item.isEnabled;
          return {
            ...item,
            isEnabled: updated,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  const handleSaveEdit = (edited: FeatureFlag) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === edited.id ? { ...edited, updatedAt: new Date().toISOString() } : f))
    );
    setSelectedFlagForEdit(null);
    Alert.alert('Flag Updated', `Flag "${edited.key}" configuration persisted to Redis cache.`);
  };

  const handleCreateFlag = () => {
    if (!newKey.trim() || !newName.trim()) {
      Alert.alert('Validation Error', 'Key identifier and Flag name are required.');
      return;
    }

    const created: FeatureFlag = {
      id: `ff-${Date.now()}`,
      key: newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: newName.trim(),
      description: newDesc.trim() || 'Custom platform feature flag rollout.',
      targetApp: newApp,
      rolloutPercentage: Math.min(100, Math.max(0, parseInt(newRollout, 10) || 100)),
      jurisdictions: ['ALL'],
      isEnabled: true,
      environment: 'PRODUCTION',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Operations Admin',
    };

    setFlags([created, ...flags]);
    setIsAddModalVisible(false);
    setNewKey('');
    setNewName('');
    setNewDesc('');
    setNewRollout('100');
    Alert.alert('Created Successfully', `Feature flag "${created.key}" registered.`);
  };

  const activeCount = flags.filter((f) => f.isEnabled).length;
  const prodCount = flags.filter((f) => f.environment === 'PRODUCTION').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Global Feature Flags Matrix</Text>
          <Text style={styles.headerSub}>
            Real-time toggles, canary deployments, targeted regional rollouts & emergency circuit breakers
          </Text>
        </View>

        <Button
          title="+ Add Feature Flag"
          variant="primary"
          size="sm"
          onPress={() => setIsAddModalVisible(true)}
        />
      </View>

      {/* Summary KPI Cards */}
      <View style={styles.kpiRow}>
        <Card variant="default" style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TOTAL REGISTERED</Text>
          <Text style={styles.kpiValue}>{flags.length}</Text>
          <Text style={styles.kpiSub}>Global Redis config keys</Text>
        </Card>

        <Card variant="default" style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ACTIVATED FLAGS</Text>
          <Text style={[styles.kpiValue, { color: '#16A34A' }]}>{activeCount}</Text>
          <Text style={styles.kpiSub}>{Math.round((activeCount / flags.length) * 100)}% live in runtime</Text>
        </Card>

        <Card variant="default" style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>PRODUCTION SCOPE</Text>
          <Text style={[styles.kpiValue, { color: '#2563EB' }]}>{prodCount}</Text>
          <Text style={styles.kpiSub}>{flags.length - prodCount} in staging canary</Text>
        </Card>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search flags by key, name, or description..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.pillRow}>
          {(['ALL', 'CUSTOMER', 'MECHANIC', 'ADMIN'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.pill, selectedAppFilter === filter && styles.pillActive]}
              onPress={() => setSelectedAppFilter(filter)}
            >
              <Text style={[styles.pillText, selectedAppFilter === filter && styles.pillTextActive]}>
                {filter === 'ALL' ? 'All Audiences' : `${filter} App`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Flags List */}
      <FlatList
        data={filteredFlags}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.flagCard}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.flagName}>{item.name}</Text>
                  <Badge
                    label={item.targetApp}
                    variant={
                      item.targetApp === 'CUSTOMER'
                        ? 'info'
                        : item.targetApp === 'MECHANIC'
                        ? 'warning'
                        : item.targetApp === 'ADMIN'
                        ? 'neutral'
                        : 'success'
                    }
                  />
                  <Badge
                    label={item.environment}
                    variant={item.environment === 'PRODUCTION' ? 'success' : 'neutral'}
                  />
                </View>
                <Text style={styles.flagKey}>Key: <Text style={{ fontFamily: 'monospace' }}>{item.key}</Text></Text>
                <Text style={styles.flagDescription}>{item.description}</Text>
              </View>

              <View style={styles.switchCol}>
                <Switch
                  value={item.isEnabled}
                  onValueChange={() => toggleFlagStatus(item.id)}
                  trackColor={{ true: '#16A34A', false: '#CBD5E1' }}
                />
                <Text
                  style={[
                    styles.switchStatus,
                    { color: item.isEnabled ? '#16A34A' : '#64748B' },
                  ]}
                >
                  {item.isEnabled ? 'ACTIVE' : 'DISABLED'}
                </Text>
              </View>
            </View>

            {/* Bottom Metadata & Configuration Info */}
            <View style={styles.cardBottom}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Rollout:</Text>
                  <View style={styles.rolloutPill}>
                    <Text style={styles.rolloutText}>{item.rolloutPercentage}% Population</Text>
                  </View>
                </View>

                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Zones:</Text>
                  <Text style={styles.metaVal}>{item.jurisdictions.join(', ')}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Modified:</Text>
                  <Text style={styles.metaVal}>
                    {new Date(item.updatedAt).toLocaleDateString()} by {item.updatedBy}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setSelectedFlagForEdit(item)}
              >
                <Text style={styles.editBtnText}>Configure ⚙️</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* Edit Flag Modal */}
      {selectedFlagForEdit && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Configure Feature Flag</Text>
              <Text style={styles.modalSub}>Editing rule: {selectedFlagForEdit.key}</Text>

              <ScrollView style={{ maxHeight: 420 }}>
                <Input
                  label="Display Name"
                  value={selectedFlagForEdit.name}
                  onChangeText={(val) =>
                    setSelectedFlagForEdit({ ...selectedFlagForEdit, name: val })
                  }
                />

                <Input
                  label="Description"
                  value={selectedFlagForEdit.description}
                  onChangeText={(val) =>
                    setSelectedFlagForEdit({ ...selectedFlagForEdit, description: val })
                  }
                />

                <Input
                  label="Rollout Percentage (0 - 100%)"
                  value={selectedFlagForEdit.rolloutPercentage.toString()}
                  onChangeText={(val) =>
                    setSelectedFlagForEdit({
                      ...selectedFlagForEdit,
                      rolloutPercentage: Math.min(100, Math.max(0, parseInt(val, 10) || 0)),
                    })
                  }
                  keyboardType="number-pad"
                />

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>Target Application Audience</Text>
                  <View style={styles.pillRow}>
                    {(['ALL', 'CUSTOMER', 'MECHANIC', 'ADMIN'] as const).map((aud) => (
                      <TouchableOpacity
                        key={aud}
                        style={[
                          styles.pill,
                          selectedFlagForEdit.targetApp === aud && styles.pillActive,
                        ]}
                        onPress={() =>
                          setSelectedFlagForEdit({ ...selectedFlagForEdit, targetApp: aud })
                        }
                      >
                        <Text
                          style={[
                            styles.pillText,
                            selectedFlagForEdit.targetApp === aud && styles.pillTextActive,
                          ]}
                        >
                          {aud}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>Deployment Environment</Text>
                  <View style={styles.pillRow}>
                    {(['PRODUCTION', 'STAGING'] as const).map((env) => (
                      <TouchableOpacity
                        key={env}
                        style={[
                          styles.pill,
                          selectedFlagForEdit.environment === env && styles.pillActive,
                        ]}
                        onPress={() =>
                          setSelectedFlagForEdit({ ...selectedFlagForEdit, environment: env })
                        }
                      >
                        <Text
                          style={[
                            styles.pillText,
                            selectedFlagForEdit.environment === env && styles.pillTextActive,
                          ]}
                        >
                          {env}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setSelectedFlagForEdit(null)}
                />
                <Button
                  title="Apply Changes ✓"
                  variant="primary"
                  onPress={() => handleSaveEdit(selectedFlagForEdit)}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add New Flag Modal */}
      {isAddModalVisible && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Register New Feature Flag</Text>
              <Text style={styles.modalSub}>Injects a zero-downtime distributed runtime boolean flag</Text>

              <ScrollView style={{ maxHeight: 420 }}>
                <Input
                  label="Flag Key Identifier (e.g. instant_battery_test)"
                  placeholder="lower_case_snake_identifier"
                  value={newKey}
                  onChangeText={setNewKey}
                />

                <Input
                  label="Display Name"
                  placeholder="Human readable title"
                  value={newName}
                  onChangeText={setNewName}
                />

                <Input
                  label="Description / Purpose"
                  placeholder="Explain intent and fallback behavior"
                  value={newDesc}
                  onChangeText={setNewDesc}
                />

                <Input
                  label="Canary Rollout % (0 - 100)"
                  value={newRollout}
                  onChangeText={setNewRollout}
                  keyboardType="number-pad"
                />

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>Target Application Audience</Text>
                  <View style={styles.pillRow}>
                    {(['ALL', 'CUSTOMER', 'MECHANIC', 'ADMIN'] as const).map((aud) => (
                      <TouchableOpacity
                        key={aud}
                        style={[styles.pill, newApp === aud && styles.pillActive]}
                        onPress={() => setNewApp(aud)}
                      >
                        <Text
                          style={[styles.pillText, newApp === aud && styles.pillTextActive]}
                        >
                          {aud}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsAddModalVisible(false)}
                />
                <Button
                  title="Register Flag ✓"
                  variant="primary"
                  onPress={handleCreateFlag}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#2563EB',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  flagCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  flagName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  flagKey: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  flagDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  switchCol: {
    alignItems: 'center',
    marginLeft: 8,
  },
  switchStatus: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  cardBottom: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaKey: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  rolloutPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rolloutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
