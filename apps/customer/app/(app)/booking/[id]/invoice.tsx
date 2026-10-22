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
import { useBookingDetail } from '@gearzo/api-client';
import { LoadingScreen, ErrorScreen } from '@gearzo/ui';

export default function InvoiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking, isLoading, isError, refetch } = useBookingDetail(id || '');

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Polite', 'Clean work']);
  const [isPaidBalance, setIsPaidBalance] = useState(false);

  const tags = ['Punctual', 'Polite', 'Clean work', 'Fair price', 'Expert Advice'];

  if (isLoading) {
    return <LoadingScreen message="Loading final invoice..." />;
  }

  if (isError || !booking) {
    return <ErrorScreen message="Could not fetch invoice details." onRetry={refetch} />;
  }

  const mechanicName = (booking as any).mechanic?.name || 'Technician';
  const totalBillPaise = booking.totalAmountPaise || 0;
  const totalBillRupees = Math.round(totalBillPaise / 100);
  const balancePaise = booking.balanceAmountPaise ?? ((booking as any).paymentStatus === 'PAID' ? 0 : totalBillPaise);
  const balanceRupees = Math.round(balancePaise / 100);
  const paidRupees = Math.max(0, totalBillRupees - balanceRupees);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePayBalance = () => {
    setIsPaidBalance(true);
    Alert.alert('Payment Successful', `Balance payment of ₹${balanceRupees} received via UPI.`);
  };

  const handleSubmitReview = () => {
    Alert.alert('Review Submitted', `Thank you for rating ${mechanicName}! Your feedback helps us maintain high quality service.`, [
      { text: 'Done', onPress: () => router.replace('/(app)/(tabs)/bookings') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Completed</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Bill Breakdown Card */}
        <View style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billItemName}>{booking.serviceName || 'Vehicle Service'}</Text>
            <Text style={styles.billItemPrice}>₹{totalBillRupees}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.totalBillLabel}>Total Bill</Text>
            <Text style={styles.totalBillPrice}>₹{totalBillRupees}</Text>
          </View>

          {paidRupees > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billSubText}>Already Paid</Text>
              <Text style={styles.billSubText}>₹{paidRupees}</Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={styles.balanceLabel}>Balance to Pay</Text>
            <Text style={styles.balancePrice}>
              {isPaidBalance || balanceRupees === 0 ? '₹0 (Paid ✓)' : `₹${balanceRupees}`}
            </Text>
          </View>
        </View>

        {/* Balance Pay Button */}
        {balanceRupees > 0 && !isPaidBalance ? (
          <TouchableOpacity style={styles.payBalanceBtn} onPress={handlePayBalance}>
            <Text style={styles.payBalanceText}>Pay ₹{balanceRupees} with UPI</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.paidBadgeBox}>
            <Text style={styles.paidBadgeText}>✓ Payment Settled</Text>
          </View>
        )}

        {/* Rating Card */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was {mechanicName}'s service?</Text>

          {/* 5 Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.starIcon, rating >= star ? styles.starFilled : styles.starEmpty]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tag Chips */}
          <View style={styles.tagsGrid}>
            {tags.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, selected && styles.tagChipSelected]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmitReview}
          activeOpacity={0.9}
        >
          <Text style={styles.submitBtnText}>Submit Rating & Finish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billItemName: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  billItemPrice: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  totalBillLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalBillPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  billSubText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  balancePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },
  payBalanceBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  payBalanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  paidBadgeBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  paidBadgeText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '700',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  starIcon: {
    fontSize: 36,
  },
  starFilled: {
    color: '#EAB308',
  },
  starEmpty: {
    color: '#E2E8F0',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  tagText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  tagTextSelected: {
    color: '#16A34A',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
