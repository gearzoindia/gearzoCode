import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button } from '@gearzo/ui';
import {
  useAdminCatalogueServices,
  useAdminCatalogueCategories,
  useAdminCreateService,
} from '@gearzo/api-client';

export default function CatalogueMasterScreen() {
  const router = useRouter();

  // Queries & Mutations
  const { data: services, isLoading, isError, refetch } = useAdminCatalogueServices();
  const { data: categories } = useAdminCatalogueCategories();
  const createServiceMutation = useAdminCreateService();

  const displayServices = Array.isArray(services) ? services : [];
  const displayCategories = Array.isArray(categories) ? categories : [];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('199');
  const [durationMin, setDurationMin] = useState('30');
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(['TWO_WHEELER']);
  const [allowedModes, setAllowedModes] = useState<string[]>(['DOORSTEP']);
  const [includesText, setIncludesText] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    // Default to first available category
    if (displayCategories.length > 0 && !categoryId) {
      setCategoryId(displayCategories[0].id);
    }
    setName('');
    setDescription('');
    setPrice('199');
    setDurationMin('30');
    setVehicleTypes(['TWO_WHEELER']);
    setAllowedModes(['DOORSTEP']);
    setIncludesText('');
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

  const toggleMode = (m: string) => {
    if (allowedModes.includes(m)) {
      if (allowedModes.length > 1) {
        setAllowedModes(allowedModes.filter((x) => x !== m));
      }
    } else {
      setAllowedModes([...allowedModes, m]);
    }
  };

  const handleCreateService = async () => {
    if (!name.trim()) {
      setFormError('Service name is required');
      return;
    }

    const effectiveCatId = categoryId || displayCategories[0]?.id;
    if (!effectiveCatId) {
      setFormError('Please select or configure a category');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid price in rupees');
      return;
    }

    const numDuration = Number(durationMin);
    if (isNaN(numDuration) || numDuration < 5) {
      setFormError('Duration must be at least 5 minutes');
      return;
    }

    setFormError('');
    try {
      const includesList = includesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await createServiceMutation.mutateAsync({
        categoryId: effectiveCatId,
        name: name.trim(),
        description: description.trim(),
        durationMin: numDuration,
        vehicleTypes,
        allowedModes,
        price: numPrice,
        basePricePaise: Math.round(numPrice * 100),
        includes: includesList,
      });

      setIsModalOpen(false);
      refetch();

      if (Platform.OS === 'web') {
        window.alert('Service created successfully!');
      } else {
        Alert.alert('Success', 'Service definition created and added to catalogue.');
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to create service');
    }
  };

  // Filtered services
  const filteredServices = displayServices.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name?.toLowerCase().includes(q);
      const matchCat = s.category?.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    if (selectedCategoryFilter !== 'ALL') {
      if (s.category !== selectedCategoryFilter && s.categoryId !== selectedCategoryFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={styles.title}>Service Catalogue Master</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{displayServices.length} Services</Text>
            </View>
          </View>
          <Text style={styles.sub}>
            Configure standard services, doorstep & roadside repairs, SLA durations & rates
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add Service</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Category Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
          <TextInput
            placeholder="Search service name or category..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPills}>
          <TouchableOpacity
            style={[styles.pill, selectedCategoryFilter === 'ALL' && styles.pillActive]}
            onPress={() => setSelectedCategoryFilter('ALL')}
          >
            <Text style={[styles.pillText, selectedCategoryFilter === 'ALL' && styles.pillTextActive]}>
              All Categories ({displayServices.length})
            </Text>
          </TouchableOpacity>

          {displayCategories.map((c) => {
            const count = displayServices.filter((s) => s.category === c.name || s.categoryId === c.id).length;
            const isSelected = selectedCategoryFilter === c.name || selectedCategoryFilter === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setSelectedCategoryFilter(c.name)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {c.name} {count > 0 ? `(${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 50 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🛠️</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>
              {searchQuery ? 'No Matching Services Found' : 'No Services In Catalogue'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              {searchQuery
                ? 'Try a different search term or category filter.'
                : "Click '+ Add Service' to create your first standard or emergency service definition."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{item.category || 'General'}</Text>
                  </View>
                  <Badge label={item.status || 'ACTIVE'} variant="success" />
                </View>

                {item.description ? (
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱</Text>
                    <Text style={styles.metaText}>{item.durationMinutes} mins SLA</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🚗</Text>
                    <Text style={styles.metaText}>
                      {(item.vehicleTypes || []).map((vt: string) => (vt === 'TWO_WHEELER' ? '2W' : '4W')).join(', ')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Base Rate</Text>
                <Text style={styles.price}>₹{((item.basePricePaise || 0) / 100).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </Card>
        )}
      />

      {/* ================= ADD SERVICE MODAL ================= */}
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
                <Text style={styles.modalTitle}>Add Service Definition</Text>
                <Text style={styles.modalSub}>
                  Create a new catalogue item with pricing, duration & vehicles
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <Text style={{ fontSize: 18, color: '#64748B', fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {formError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {formError}</Text>
                </View>
              ) : null}

              {/* Category Picker */}
              <Text style={styles.label}>Select Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {displayCategories.map((c) => {
                    const isSelected = (categoryId || displayCategories[0]?.id) === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.catOption, isSelected && styles.catOptionSelected]}
                        onPress={() => setCategoryId(c.id)}
                      >
                        <Text style={[styles.catOptionText, isSelected && styles.catOptionTextSelected]}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Service Name */}
              <Text style={styles.label}>Service Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Doorstep Bike Puncture Repair"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Brief summary of what this service covers..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                value={description}
                onChangeText={setDescription}
              />

              {/* Row: Price & Duration */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Base Rate (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="199"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Duration (Mins) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={durationMin}
                    onChangeText={setDurationMin}
                  />
                </View>
              </View>

              {/* Vehicle Types */}
              <Text style={styles.label}>Applicable Vehicle Types *</Text>
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

              {/* Service Delivery Modes */}
              <Text style={styles.label}>Service Delivery Modes</Text>
              <View style={styles.toggleRow}>
                {[
                  { key: 'DOORSTEP', label: '🏠 Doorstep Service' },
                  { key: 'TOWING', label: '🚨 Roadside Breakdown / Towing' },
                  { key: 'PICKUP_DROP', label: '🚗 Pickup & Drop' },
                  { key: 'GARAGE_VISIT', label: '🏭 Workshop Visit' },
                ].map((m) => {
                  const isChecked = allowedModes.includes(m.key);
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[styles.toggleBtn, isChecked && styles.toggleBtnActive]}
                      onPress={() => toggleMode(m.key)}
                    >
                      <Text style={[styles.toggleBtnText, isChecked && styles.toggleBtnTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Scope & Inclusions */}
              <Text style={styles.label}>Checklist / Inclusions (Comma Separated)</Text>
              <TextInput
                style={[styles.input, { height: 50 }]}
                placeholder="e.g. Leak detection, Rubber seal plug, Pressure inflation"
                placeholderTextColor="#94A3B8"
                value={includesText}
                onChangeText={setIncludesText}
              />
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
                disabled={createServiceMutation.isPending}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, createServiceMutation.isPending && { opacity: 0.7 }]}
                onPress={handleCreateService}
                disabled={createServiceMutation.isPending}
              >
                {createServiceMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Service</Text>
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
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
  categoryPills: {
    flexDirection: 'row',
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 2,
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
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catOptionSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  catOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catOptionTextSelected: {
    color: '#15803D',
    fontWeight: '700',
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
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
