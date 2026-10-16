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
import { useVehicles, useServiceDetail, useQuote, useCreateBooking } from '@gearzo/api-client';
import { Card, Button, Input, LoadingScreen } from '@gearzo/ui';

const TIME_SLOTS = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:30 PM'];

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ serviceId?: string; vehicleId?: string }>();

  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    params.vehicleId || ''
  );

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const activeVehicle =
    vehicleList.find((v) => v.id === selectedVehicleId) ||
    vehicleList.find((v) => v.isDefault) ||
    vehicleList[0];

  const serviceId = params.serviceId || 'srv-std-2w';
  const { data: service, isLoading: loadingService } = useServiceDetail(serviceId);

  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [address, setAddress] = useState<string>(
    'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103'
  );
  const [notes, setNotes] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPaise, setDiscountPaise] = useState<number>(0);

  const basePricePaise = service?.basePricePaise || 99900;
  const platformFeePaise = 4900; // ₹49
  const taxesPaise = Math.round((basePricePaise + platformFeePaise) * 0.18); // 18% GST
  const totalAmountPaise = Math.max(0, basePricePaise + platformFeePaise + taxesPaise - discountPaise);

  const createBookingMutation = useCreateBooking();

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'GEARZO100') {
      setDiscountPaise(10000); // ₹100
      Alert.alert('Coupon Applied', '₹100 discount applied to your order!');
    } else {
      Alert.alert('Invalid Coupon', 'Coupon code is invalid or expired. Try "GEARZO100"');
    }
  };

  const handleProceedToPayment = async () => {
    if (!activeVehicle) {
      Alert.alert('Add Vehicle', 'Please add a vehicle before proceeding to checkout.');
      router.push('/vehicles/add');
      return;
    }

    try {
      const scheduledDate = new Date();
      if (selectedDate === 'tomorrow') {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }
      const scheduledIso = scheduledDate.toISOString();

      const booking = await createBookingMutation.mutateAsync({
        serviceId: service?.id || serviceId,
        vehicleId: activeVehicle.id,
        scheduledAt: scheduledIso,
        address,
        latitude: 12.9352,
        longitude: 77.6772,
        notes: notes || undefined,
      });

      router.push({
        pathname: '/booking/payment',
        params: {
          bookingId: booking.id,
          amountPaise: totalAmountPaise.toString(),
        },
      });
    } catch {
      // In case API mock is offline, navigate with dummy id
      router.push({
        pathname: '/booking/payment',
        params: {
          bookingId: `gz-${Date.now()}`,
          amountPaise: totalAmountPaise.toString(),
        },
      });
    }
  };

  if (loadingVehicles || loadingService) {
    return <LoadingScreen message="Preparing order checkout..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Service Summary Card */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Selected Service</Text>
          <View style={styles.serviceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{service?.name || 'Standard Periodic Service'}</Text>
              <Text style={styles.serviceSub}>⏱ ~{service?.durationMinutes || 60} mins duration</Text>
            </View>
            <Text style={styles.servicePrice}>
              ₹{(basePricePaise / 100).toLocaleString('en-IN')}
            </Text>
          </View>
        </Card>

        {/* Vehicle Selection Card */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardHeader}>Vehicle to Service</Text>
            <TouchableOpacity onPress={() => router.push('/vehicles/add')}>
              <Text style={styles.linkAction}>+ Add / Change</Text>
            </TouchableOpacity>
          </View>

          {activeVehicle ? (
            <View style={styles.vehicleSelectedBox}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>
                {activeVehicle.type === 'TWO_WHEELER' ? '🛵' : '🚗'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleTitle}>
                  {activeVehicle.brand} {activeVehicle.model}
                </Text>
                <Text style={styles.vehicleReg}>{activeVehicle.registrationNumber}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.noVehicleBox}
              onPress={() => router.push('/vehicles/add')}
            >
              <Text style={styles.noVehicleText}>+ Tap to select or add your vehicle</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Doorstep Service Location */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardHeader}>Service Address</Text>
            <TouchableOpacity onPress={() => router.push('/addresses')}>
              <Text style={styles.linkAction}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 18, marginRight: 8, marginTop: 2 }}>📍</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </Card>

        {/* Date & Time Slot */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Select Date & Arrival Slot</Text>

          {/* Date Selector */}
          <View style={styles.dateSelectorRow}>
            <TouchableOpacity
              style={[styles.dateButton, selectedDate === 'today' && styles.dateButtonActive]}
              onPress={() => setSelectedDate('today')}
            >
              <Text style={[styles.dateButtonText, selectedDate === 'today' && styles.dateButtonTextActive]}>
                Today (Instant)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, selectedDate === 'tomorrow' && styles.dateButtonActive]}
              onPress={() => setSelectedDate('tomorrow')}
            >
              <Text style={[styles.dateButtonText, selectedDate === 'tomorrow' && styles.dateButtonTextActive]}>
                Tomorrow
              </Text>
            </TouchableOpacity>
          </View>

          {/* Slot Grid */}
          <View style={styles.slotGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotItem, isSelected && styles.slotItemActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Promo Code Input */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Offers & Promo Code</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Enter coupon code (e.g. GEARZO100)"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <Button
              title="Apply"
              variant="outline"
              size="md"
              onPress={handleApplyCoupon}
            />
          </View>
        </Card>

        {/* Notes for Mechanic */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Notes for Mechanic (Optional)</Text>
          <Input
            placeholder="e.g. Squeaking noise while braking, park near gate 2"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            containerStyle={{ marginBottom: 0, marginTop: 8 }}
          />
        </Card>

        {/* Bill Summary */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{(basePricePaise / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Convenience / Platform Fee</Text>
            <Text style={styles.billValue}>₹{(platformFeePaise / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST & Service Tax (18%)</Text>
            <Text style={styles.billValue}>₹{(taxesPaise / 100).toFixed(2)}</Text>
          </View>
          {discountPaise > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: '#1B5E20' }]}>Promo Discount</Text>
              <Text style={[styles.billValue, { color: '#1B5E20' }]}>
                -₹{(discountPaise / 100).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>To Pay</Text>
            <Text style={styles.billTotalValue}>₹{(totalAmountPaise / 100).toFixed(2)}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Sticky Checkout CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPrice}>₹{(totalAmountPaise / 100).toLocaleString('en-IN')}</Text>
        </View>

        <Button
          title="Proceed to Pay →"
          variant="primary"
          size="lg"
          loading={createBookingMutation.isPending}
          onPress={handleProceedToPayment}
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
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  linkAction: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: '600',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  serviceSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  vehicleSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  vehicleReg: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noVehicleBox: {
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    alignItems: 'center',
  },
  noVehicleText: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    marginTop: 4,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dateButtonActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  dateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  slotItemActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  slotTextActive: {
    color: '#1B5E20',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
  },
});
