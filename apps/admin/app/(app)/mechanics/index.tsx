import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminMechanics, useAdminCreateMechanic } from '@gearzo/api-client';
import { Card, Badge, Avatar, LoadingScreen } from '@gearzo/ui';

export default function AdminMechanicsListScreen() {
  const router = useRouter();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING_KYC' | 'ONLINE'>('ALL');

  // Queries & Mutations
  const { data: mechanics, isLoading, isError, refetch } = useAdminMechanics(search || undefined);
  const createMechanicMutation = useAdminCreateMechanic();

  const displayMechanics = Array.isArray(mechanics) ? mechanics : [];

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationType, setRegistrationType] = useState<'INDIVIDUAL' | 'SHOP'>('INDIVIDUAL');
  const [shopName, setShopName] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('10');
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(['TWO_WHEELER']);
  const [autoApprove, setAutoApprove] = useState(true);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setName('');
    setPhone('');
    setRegistrationType('INDIVIDUAL');
    setShopName('');
    setExperienceYears('3');
    setServiceRadiusKm('10');
    setVehicleTypes(['TWO_WHEELER']);
    setAutoApprove(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleVehicleType = (vt: string) => {
    if (vehicleTypes.includes(vt)) {
      if (vehicleTypes.length > 1) {
        setVehicleTypes(vehicleTypes.filter((t) => t !== vt));
      }
    } else {
      setVehicleTypes([...vehicleTypes, vt]);
    }
  };

  const handleCreateMechanic = async () => {
    if (!name.trim()) {
      setFormError('Please enter mechanic full name');
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    const exp = Number(experienceYears);
    if (isNaN(exp) || exp < 0) {
      setFormError('Please enter valid experience years');
      return;
    }

    const radius = Number(serviceRadiusKm);
    if (isNaN(radius) || radius < 1) {
      setFormError('Please enter valid coverage radius in km');
      return;
    }

    setFormError('');
    try {
      await createMechanicMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        registrationType,
        shopName: registrationType === 'SHOP' ? shopName.trim() : undefined,
        experienceYears: exp,
        serviceRadiusKm: radius,
        vehicleTypes,
        status: autoApprove ? 'APPROVED' : 'PENDING_KYC',
      });

      setIsModalOpen(false);
      refetch();

      if (Platform.OS === 'web') {
        window.alert(`Mechanic ${name.trim()} added successfully!`);
      } else {
        Alert.alert('Success', `Mechanic partner ${name.trim()} has been registered.`);
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to add mechanic partner');
    }
  };

  // Filtered List
  const filteredMechanics = displayMechanics.filter((m) => {
    if (statusFilter === 'APPROVED') {
      return m.kycStatus === 'APPROVED' || m.kycStatus === 'VERIFIED';
    }
    if (statusFilter === 'PENDING_KYC') {
      return m.kycStatus === 'PENDING_KYC' || m.kycStatus === 'UNDER_REVIEW' || m.kycStatus === 'SUBMITTED';
    }
    if (statusFilter === 'ONLINE') {
      return m.isOnline;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={styles.title}>Mechanics & Service Partners</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{displayMechanics.length} Partners</Text>
            </View>
          </View>
          <Text style={styles.sub}>Verified technicians directory, live duty status & onboarding</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={styles.kycBtn}
            onPress={() => router.push('/mechanics/kyc-queue')}
            activeOpacity={0.8}
          >
            <Text style={styles.kycBtnText}>Pending KYC 🪪</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add Mechanic</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search & Filter Pills */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
          <TextInput
            placeholder="Search mechanic name or mobile number..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterPills}>
          {[
            { key: 'ALL', label: `All Partners (${displayMechanics.length})` },
            {
              key: 'APPROVED',
              label: `Certified / Approved (${displayMechanics.filter((m) => m.kycStatus === 'APPROVED' || m.kycStatus === 'VERIFIED').length})`,
            },
            {
              key: 'PENDING_KYC',
              label: `Pending KYC (${displayMechanics.filter((m) => m.kycStatus === 'PENDING_KYC' || m.kycStatus === 'UNDER_REVIEW' || m.kycStatus === 'SUBMITTED').length})`,
            },
            {
              key: 'ONLINE',
              label: `Online Now (${displayMechanics.filter((m) => m.isOnline).length})`,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setStatusFilter(tab.key as any)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredMechanics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 50 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🔧</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>
              {search ? 'No Matching Mechanics' : 'No Mechanics Found'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              {search
                ? 'Try searching by a different name or phone number.'
                : "Click '+ Add Mechanic' above to onboard your first mechanic directly."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/mechanics/${item.id}`)}
              style={styles.row}
              activeOpacity={0.7}
            >
              <Avatar name={item.name} size="md" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Badge
                    label={item.isOnline ? 'ONLINE' : 'OFFLINE'}
                    variant={item.isOnline ? 'success' : 'neutral'}
                  />
                  <Badge
                    label={item.kycStatus || 'APPROVED'}
                    variant={item.kycStatus === 'APPROVED' || item.kycStatus === 'VERIFIED' ? 'success' : 'warning'}
                  />
                </View>

                <Text style={styles.phone}>
                  {item.phone} • {item.type === 'SHOP' ? 'Workshop Owner' : 'Individual Tech'}
                </Text>

                <Text style={styles.meta}>
                  ★ {item.rating > 0 ? item.rating.toFixed(1) : '5.0'} • {item.totalJobs} jobs completed
                </Text>
              </View>

              <View style={styles.actionPill}>
                <Text style={styles.actionPillText}>Profile & KYC ›</Text>
              </View>
            </TouchableOpacity>
          </Card>
        )}
      />

      {/* ================= ADD MECHANIC MODAL ================= */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register Mechanic Partner</Text>
                <Text style={styles.modalSub}>
                  Directly onboard a technician or workshop owner into GearZo
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <Text style={{ fontSize: 18, color: '#64748B', fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {formError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {formError}</Text>
                </View>
              ) : null}

              {/* Full Name */}
              <Text style={styles.label}>Mechanic Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Patil"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />

              {/* Mobile Number */}
              <Text style={styles.label}>Mobile Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9876543210 or +91 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              {/* Partner Type */}
              <Text style={styles.label}>Partner Registration Type</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    registrationType === 'INDIVIDUAL' && styles.toggleBtnActive,
                  ]}
                  onPress={() => setRegistrationType('INDIVIDUAL')}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      registrationType === 'INDIVIDUAL' && styles.toggleBtnTextActive,
                    ]}
                  >
                    👤 Individual Mobile Mechanic
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    registrationType === 'SHOP' && styles.toggleBtnActive,
                  ]}
                  onPress={() => setRegistrationType('SHOP')}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      registrationType === 'SHOP' && styles.toggleBtnTextActive,
                    ]}
                  >
                    🏭 Workshop / Garage Owner
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Shop Name (if shop) */}
              {registrationType === 'SHOP' && (
                <>
                  <Text style={styles.label}>Garage / Workshop Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Shree Auto Works & Garage"
                    placeholderTextColor="#94A3B8"
                    value={shopName}
                    onChangeText={setShopName}
                  />
                </>
              )}

              {/* Row: Experience & Radius */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Experience (Years)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Service Radius (Km)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={serviceRadiusKm}
                    onChangeText={setServiceRadiusKm}
                  />
                </View>
              </View>

              {/* Vehicle Specialization */}
              <Text style={styles.label}>Vehicle Specialization</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    vehicleTypes.includes('TWO_WHEELER') && styles.toggleBtnActive,
                  ]}
                  onPress={() => toggleVehicleType('TWO_WHEELER')}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      vehicleTypes.includes('TWO_WHEELER') && styles.toggleBtnTextActive,
                    ]}
                  >
                    🏍️ Two-Wheeler (2W)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    vehicleTypes.includes('FOUR_WHEELER') && styles.toggleBtnActive,
                  ]}
                  onPress={() => toggleVehicleType('FOUR_WHEELER')}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      vehicleTypes.includes('FOUR_WHEELER') && styles.toggleBtnTextActive,
                    ]}
                  >
                    🚗 Four-Wheeler (4W)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Instant Verification Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAutoApprove(!autoApprove)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, autoApprove && styles.checkboxChecked]}>
                  {autoApprove && <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>✓</Text>}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.checkboxLabel}>Instantly Certify & Approve Account</Text>
                  <Text style={styles.checkboxSub}>
                    Partner will bypass manual KYC review queue and become eligible for dispatch immediately.
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
                disabled={createMechanicMutation.isPending}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, createMechanicMutation.isPending && { opacity: 0.7 }]}
                onPress={handleCreateMechanic}
                disabled={createMechanicMutation.isPending}
              >
                {createMechanicMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Register Mechanic</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
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
  countBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 11,
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  kycBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  kycBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  pillActive: {
    backgroundColor: '#0F172A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  card: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  phone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  meta: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    marginTop: 3,
  },
  actionPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    padding: 18,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtnActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#0369A1',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  checkboxSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
