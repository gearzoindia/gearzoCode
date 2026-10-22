import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVehicles, useCreateBooking, useAuth } from '@gearzo/api-client';
import { useCartStore } from '../../../stores/cart-store';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();

  const {
    items: cartItems,
    removeItem,
    clearCart,
    selectedServiceMode,
    setServiceMode,
    selectedTiming,
    setTiming,
    scheduledDate,
    scheduledSlot,
    slotInstructions,
    setSlot,
    couponCode,
    discountPaise,
    applyCoupon,
    removeCoupon,
    getItemsTotalPaise,
    getGstPaise,
    getFinalTotalPaise,
  } = useCartStore();

  const createBookingMutation = useCreateBooking();

  const vehicleList = Array.isArray(vehicles) ? vehicles : [];
  const activeVehicle = vehicleList.find((v) => v.isDefault) || vehicleList[0] || null;

  // State for Screen 11 Modal (Select Slot)
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [tempDate, setTempDate] = useState(scheduledDate || 'Today 14');
  const [tempDayPart, setTempDayPart] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [tempSlot, setTempSlot] = useState(scheduledSlot || '10:00 AM');
  const [tempInstructions, setTempInstructions] = useState(slotInstructions || '');

  // State for Coupon Input Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Address
  const addressText = user?.city ? `119–120, Madhapur, ${user.city} 500081` : '119–120, Madhapur, Hyderabad 500081';

  // Dates for Screen 11
  const dates = [
    { label: 'Today', day: '14' },
    { label: 'Tomorrow', day: '15' },
    { label: 'Fri', day: '16' },
    { label: 'Sat', day: '17' },
    { label: 'Sun', day: '18' },
  ];

  const morningSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
  const afternoonSlots = ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const eveningSlots = ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

  const currentSlotOptions =
    tempDayPart === 'Morning'
      ? morningSlots
      : tempDayPart === 'Afternoon'
      ? afternoonSlots
      : eveningSlots;

  const handleSaveSlot = () => {
    setSlot(tempDate, tempSlot, tempInstructions);
    setTiming('SCHEDULE');
    setShowSlotModal(false);
  };

  const handleApplyCouponSubmit = () => {
    setCouponError(null);
    if (!inputCoupon.trim()) return;
    const success = applyCoupon(inputCoupon);
    if (success) {
      setShowCouponModal(false);
      setInputCoupon('');
    } else {
      setCouponError('Invalid coupon. Try GEARZO150 for ₹150 OFF!');
    }
  };

  const handleProceed = async (paymentMode: 'PAY_NOW' | 'PAY_AFTER_SERVICE') => {
    if (!activeVehicle) {
      Alert.alert('Vehicle Required', 'Please select or add a vehicle to continue with booking.', [
        { text: 'Add Vehicle', onPress: () => router.push('/vehicles/add') },
      ]);
      return;
    }

    const finalAmount = getFinalTotalPaise();
    const primaryService = cartItems.find((i) => i.type === 'SERVICE') || cartItems[0];
    if (!primaryService) {
      Alert.alert('Cart Empty', 'Please add a service to your cart.');
      return;
    }

    try {
      const scheduledIso = new Date().toISOString();
      const booking = await createBookingMutation.mutateAsync({
        serviceId: primaryService.id,
        vehicleId: activeVehicle.id,
        scheduledAt: scheduledIso,
        address: addressText,
        latitude: 17.4485,
        longitude: 78.3756,
        notes: slotInstructions || undefined,
      });

      if (paymentMode === 'PAY_NOW') {
        router.push({
          pathname: '/booking/payment',
          params: {
            bookingId: booking.id,
            amountPaise: finalAmount.toString(),
          },
        });
      } else {
        // Pay after service: direct confirmation
        router.push({
          pathname: '/booking/confirmed',
          params: {
            bookingId: booking.id,
            amountPaise: finalAmount.toString(),
            payAfter: 'true',
          },
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to complete booking on the server. Please try again.';
      Alert.alert('Booking Error', msg);
    }
  };

  const subtotalPaise = getItemsTotalPaise();
  const gstPaise = getGstPaise();
  const totalAmountPaise = getFinalTotalPaise();

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 50, marginBottom: 16 }}>🛒</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
            Your Cart is Empty
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
            Explore our vehicle catalogue to select services or repairs before proceeding to checkout.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#16A34A', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 }}
            onPress={() => router.replace('/services')}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header (Screens 10 & 12) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Booking for Vehicle (Screen 10) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking for Vehicle</Text>
          <View style={styles.cardRow}>
            <View style={styles.vehicleIconWrap}>
              <Text style={{ fontSize: 20 }}>
                {activeVehicle?.type === 'FOUR_WHEELER' ? '🚗' : '🏍️'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSub}>Selected Vehicle</Text>
              <Text style={styles.vehicleName}>
                {activeVehicle ? `${activeVehicle.brand ? `${activeVehicle.brand} ` : ''}${activeVehicle.model}` : 'No vehicle selected'}{' '}
                {activeVehicle?.registrationNumber ? (
                  <Text style={styles.regNumber}>
                    ({activeVehicle.registrationNumber})
                  </Text>
                ) : null}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/vehicles/add')}>
              <Text style={styles.changeLink}>{activeVehicle ? 'Change' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2: Booking Address (Screen 10) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Address</Text>
          <View style={styles.cardRow}>
            <View style={[styles.vehicleIconWrap, { backgroundColor: '#F1F3F2' }]}>
              <Text style={{ fontSize: 20 }}>🏠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>HOME</Text>
              <Text style={styles.addressSub}>{addressText}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/addresses')}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 3: Select Service Type & Schedule (Screen 10 & 11) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select your Service Type</Text>

          {/* Doorstep vs Pickup-Drop */}
          <View style={styles.serviceTypeRow}>
            <TouchableOpacity
              style={[
                styles.serviceTypeChip,
                selectedServiceMode === 'DOORSTEP' && styles.serviceTypeChipActive,
              ]}
              onPress={() => setServiceMode('DOORSTEP')}
            >
              <Text
                style={[
                  styles.serviceTypeChipText,
                  selectedServiceMode === 'DOORSTEP' && styles.serviceTypeChipTextActive,
                ]}
              >
                {selectedServiceMode === 'DOORSTEP' ? '✓ ' : '○ '}Doorstep
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceTypeChip,
                selectedServiceMode === 'PICKUP_DROP' && styles.serviceTypeChipActive,
              ]}
              onPress={() => setServiceMode('PICKUP_DROP')}
            >
              <Text
                style={[
                  styles.serviceTypeChipText,
                  selectedServiceMode === 'PICKUP_DROP' && styles.serviceTypeChipTextActive,
                ]}
              >
                {selectedServiceMode === 'PICKUP_DROP' ? '✓ ' : '○ '}Pickup-Drop
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instant vs Schedule */}
          <View style={styles.timingSegment}>
            <TouchableOpacity
              style={[
                styles.timingOption,
                selectedTiming === 'INSTANT' && styles.timingOptionActive,
              ]}
              onPress={() => setTiming('INSTANT')}
            >
              <Text style={styles.timingIcon}>⚡</Text>
              <Text
                style={[
                  styles.timingTitle,
                  selectedTiming === 'INSTANT' && styles.timingTitleActive,
                ]}
              >
                Instant
              </Text>
              <Text
                style={[
                  styles.timingSub,
                  selectedTiming === 'INSTANT' && styles.timingSubActive,
                ]}
              >
                ETA: 30-45 mins
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timingOption,
                selectedTiming === 'SCHEDULE' && styles.timingOptionActive,
              ]}
              onPress={() => {
                setTiming('SCHEDULE');
                setShowSlotModal(true);
              }}
            >
              <Text style={styles.timingIcon}>📅</Text>
              <Text
                style={[
                  styles.timingTitle,
                  selectedTiming === 'SCHEDULE' && styles.timingTitleActive,
                ]}
              >
                Schedule
              </Text>
              <Text
                style={[
                  styles.timingSub,
                  selectedTiming === 'SCHEDULE' && styles.timingSubActive,
                ]}
              >
                {selectedTiming === 'SCHEDULE' ? `${scheduledDate}, ${scheduledSlot}` : 'Pick slot'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fastest Available Mechanic Info Card */}
          <View style={styles.fastestMechanicBanner}>
            <View style={styles.zapIconWrap}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fastestTitle}>Fastest Available Mechanic</Text>
              <Text style={styles.fastestSub}>
                {selectedTiming === 'INSTANT'
                  ? 'Estimated arrival: 30-45 mins'
                  : `Scheduled for: ${scheduledDate} at ${scheduledSlot}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 4: Items in this order (Screens 10 & 12) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Item in this order</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItemRow}>
              <View style={styles.itemThumbnail}>
                <Text style={{ fontSize: 22 }}>
                  {item.type === 'PRODUCT'
                    ? item.name.includes('Battery')
                      ? '🔋'
                      : '🛢️'
                    : '🔧'}
                </Text>
              </View>
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemPrice}>
                  ₹ {Math.round(item.pricePaise / 100)}
                </Text>
              </View>
              {cartItems.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeItem(item.id)}
                  style={styles.removeItemBtn}
                >
                  <Text style={styles.removeItemText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Card 5: Instruction (Screen 12) */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontSize: 14 }]}>Instruction</Text>
          <TouchableOpacity
            style={styles.instructionBox}
            onPress={() => setShowSlotModal(true)}
          >
            <Text style={styles.instructionText}>
              {slotInstructions || 'Any specific instructions? e.g. Please bring Castrol Oil…'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card 6: Apply Coupon (Screen 12) */}
        <TouchableOpacity
          style={[styles.card, styles.couponCard]}
          onPress={() => setShowCouponModal(true)}
        >
          <View style={styles.couponIconWrap}>
            <Text style={{ fontSize: 18 }}>🎟️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.couponTitle}>
              {couponCode ? `Coupon applied: ${couponCode}` : 'Apply coupon'}
            </Text>
            {couponCode && (
              <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '700' }}>
                ₹{discountPaise / 100} saved on this order
              </Text>
            )}
          </View>
          {couponCode ? (
            <TouchableOpacity onPress={removeCoupon} style={{ padding: 4 }}>
              <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '700' }}>
                Remove
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 18, color: '#9CA3AF' }}>›</Text>
          )}
        </TouchableOpacity>

        {/* Card 7: Billing Details (Screen 12) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Billing Details</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>
              {cartItems.length} x Item{cartItems.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.billingValue}>
              ₹ {(subtotalPaise / 100).toFixed(2)}
            </Text>
          </View>

          <View style={styles.billingRow}>
            <Text style={[styles.billingLabel, { color: '#6B7C72' }]}>
              Includes GST (18%)
            </Text>
            <Text style={[styles.billingValue, { color: '#6B7C72' }]}>
              ₹ {(gstPaise / 100).toFixed(2)}
            </Text>
          </View>

          {discountPaise > 0 && (
            <View style={styles.billingRow}>
              <Text style={[styles.billingLabel, { color: '#16A34A', fontWeight: '700' }]}>
                Coupon Discount ({couponCode})
              </Text>
              <Text style={[styles.billingValue, { color: '#16A34A', fontWeight: '700' }]}>
                - ₹ {(discountPaise / 100).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.billingDivider} />

          <View style={styles.billingRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₹ {(totalAmountPaise / 100).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar: Pay After Service / Pay Now (Screens 10 & 12) */}
      <View style={styles.fixedBottomBar}>
        <TouchableOpacity
          style={styles.payAfterBtn}
          onPress={() => handleProceed('PAY_AFTER_SERVICE')}
        >
          <Text style={styles.payAfterText}>Pay After Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.payNowBtn}
          onPress={() => handleProceed('PAY_NOW')}
        >
          <Text style={styles.payNowText}>Pay Now</Text>
        </TouchableOpacity>
      </View>

      {/* Screen 11: Select Slot Modal */}
      <Modal visible={showSlotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.slotSheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.slotSheetTitle}>Select Slot</Text>

            {/* Pick a Date */}
            <Text style={styles.slotSectionHeading}>Pick a Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {dates.map((d) => {
                const isSelected = tempDate.includes(d.day);
                return (
                  <TouchableOpacity
                    key={d.day}
                    style={[styles.dateChip, isSelected && styles.dateChipActive]}
                    onPress={() => setTempDate(`${d.label} ${d.day}`)}
                  >
                    <Text style={[styles.dateChipLabel, isSelected && { color: '#fff' }]}>
                      {d.label}
                    </Text>
                    <Text style={[styles.dateChipDay, isSelected && { color: '#fff' }]}>
                      {d.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Morning / Afternoon / Evening Segments */}
            <View style={styles.dayPartSegment}>
              {(['Morning', 'Afternoon', 'Evening'] as const).map((part) => (
                <TouchableOpacity
                  key={part}
                  style={[styles.dayPartOption, tempDayPart === part && styles.dayPartOptionActive]}
                  onPress={() => setTempDayPart(part)}
                >
                  <Text
                    style={[
                      styles.dayPartText,
                      tempDayPart === part && styles.dayPartTextActive,
                    ]}
                  >
                    {part}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Available Slots */}
            <Text style={styles.slotSectionHeading}>Available Slots</Text>
            <View style={styles.slotsGrid}>
              {currentSlotOptions.map((s) => {
                const isSelected = tempSlot === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.slotPill, isSelected && styles.slotPillActive]}
                    onPress={() => setTempSlot(s)}
                  >
                    <Text style={[styles.slotPillText, isSelected && styles.slotPillTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Your Preference */}
            <Text style={styles.slotSectionHeading}>Your Preference</Text>
            <TextInput
              style={styles.preferenceInput}
              placeholder="Any specific instructions? e.g. Please bring Castrol Oil…"
              placeholderTextColor="#A6B1AB"
              multiline
              value={tempInstructions}
              onChangeText={setTempInstructions}
            />

            {/* Save CTA */}
            <TouchableOpacity style={styles.saveSlotBtn} onPress={handleSaveSlot}>
              <Text style={styles.saveSlotBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Coupon Modal */}
      <Modal visible={showCouponModal} transparent animationType="fade">
        <View style={styles.modalCenterOverlay}>
          <View style={styles.couponModalContent}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F1F16', marginBottom: 6 }}>
              Apply Coupon Code
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7C72', marginBottom: 12 }}>
              Try code "GEARZO150" for ₹150 OFF on your booking
            </Text>

            <TextInput
              style={styles.couponTextInput}
              placeholder="Enter code e.g. GEARZO150"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              value={inputCoupon}
              onChangeText={setInputCoupon}
            />

            {couponError && (
              <Text style={{ color: '#DC2626', fontSize: 11, marginBottom: 8 }}>
                {couponError}
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                style={styles.couponCancelBtn}
                onPress={() => {
                  setShowCouponModal(false);
                  setCouponError(null);
                }}
              >
                <Text style={{ color: '#6B7C72', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.couponApplyBtn}
                onPress={handleApplyCouponSubmit}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Apply</Text>
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
    backgroundColor: '#F2F4F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3EAE5',
  },
  backBtn: {
    padding: 6,
  },
  backBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F1F16',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1F16',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3EAE5',
    shadowColor: '#0B4A27',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  labelSub: {
    fontSize: 10.5,
    color: '#6B7C72',
    fontWeight: '500',
  },
  vehicleName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
  },
  regNumber: {
    fontWeight: '600',
    color: '#6B7C72',
    fontSize: 12,
  },
  changeLink: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 12,
    padding: 4,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F1F16',
  },
  addressSub: {
    fontSize: 11,
    color: '#6B7C72',
    marginTop: 2,
  },
  serviceTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  serviceTypeChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  serviceTypeChipActive: {
    backgroundColor: '#E3F6EA',
    borderColor: '#16A34A',
  },
  serviceTypeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7C72',
  },
  serviceTypeChipTextActive: {
    color: '#0B4A27',
    fontWeight: '800',
  },
  timingSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F4F2',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  timingOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  timingOptionActive: {
    backgroundColor: '#16A34A',
  },
  timingIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  timingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7C72',
  },
  timingTitleActive: {
    color: '#FFFFFF',
  },
  timingSub: {
    fontSize: 9.5,
    color: '#6B7C72',
    marginTop: 2,
  },
  timingSubActive: {
    color: '#EAF7EE',
  },
  fastestMechanicBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1FBF5',
    borderWidth: 1.5,
    borderColor: '#8ADBAA',
    borderRadius: 14,
    padding: 10,
  },
  zapIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fastestTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B4A27',
  },
  fastestSub: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
  },
  orderItemPrice: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 2,
  },
  removeItemBtn: {
    padding: 4,
  },
  removeItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  instructionBox: {
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#FAFBFA',
  },
  instructionText: {
    fontSize: 11,
    color: '#6B7C72',
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E3F6EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1F16',
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  billingLabel: {
    fontSize: 12,
    color: '#0F1F16',
    fontWeight: '600',
  },
  billingValue: {
    fontSize: 12,
    color: '#0F1F16',
    fontWeight: '700',
  },
  billingDivider: {
    height: 1,
    backgroundColor: '#E3EAE5',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1F16',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#0B4A27',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 8,
  },
  payAfterBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payAfterText: {
    color: '#0B4A27',
    fontSize: 12.5,
    fontWeight: '800',
  },
  payNowBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Modal styles for Screen 11
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  slotSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 16,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#D5DBD7',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  slotSheetTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 12,
  },
  slotSectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F1F16',
    marginBottom: 8,
    marginTop: 4,
  },
  dateChip: {
    width: 54,
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  dateChipLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B7C72',
  },
  dateChipDay: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1F16',
    marginTop: 2,
  },
  dayPartSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F4F2',
    borderRadius: 14,
    padding: 4,
    marginVertical: 10,
  },
  dayPartOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
  },
  dayPartOptionActive: {
    backgroundColor: '#FFFFFF',
  },
  dayPartText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6B7C72',
  },
  dayPartTextActive: {
    color: '#0F1F16',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  slotPill: {
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  slotPillActive: {
    backgroundColor: '#E3F6EA',
    borderColor: '#16A34A',
  },
  slotPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F1F16',
  },
  slotPillTextActive: {
    color: '#0B4A27',
  },
  preferenceInput: {
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 14,
    padding: 10,
    fontSize: 11,
    color: '#0F1F16',
    minHeight: 66,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  saveSlotBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 26,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveSlotBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  // Coupon Modal
  modalCenterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  couponModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxWidth: 340,
  },
  couponTextInput: {
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1F16',
    marginBottom: 8,
  },
  couponCancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E3EAE5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  couponApplyBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
