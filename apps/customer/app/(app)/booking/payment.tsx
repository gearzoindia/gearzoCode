import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../../stores/cart-store';

type UpiOption = 'GPAY' | 'PHONEPE' | 'PAYTM' | 'NEW_UPI';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string; amountPaise?: string }>();
  const { getFinalTotalPaise } = useCartStore();

  const bookingId = params.bookingId || '';
  const amountPaise = params.amountPaise ? parseInt(params.amountPaise, 10) : getFinalTotalPaise();
  const displayAmount = Math.round(amountPaise / 100);

  const [selectedUpi, setSelectedUpi] = useState<UpiOption>('GPAY');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.replace({
        pathname: '/booking/confirmed',
        params: {
          bookingId,
          amountPaise: amountPaise.toString(),
        },
      });
    }, 1200);
  };

  const handleSimulateFail = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push({
        pathname: '/booking/payment-failed',
        params: {
          bookingId,
          amountPaise: amountPaise.toString(),
        },
      });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <TouchableOpacity onPress={handleSimulateFail} style={{ padding: 6 }}>
          <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600' }}>Simulate Fail</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Top Dark Green Amount Payable Card */}
        <View style={styles.amountCard}>
          <View>
            <Text style={styles.amountLabel}>Amount payable</Text>
            <Text style={styles.amountValue}>₹{displayAmount}</Text>
          </View>
          <View style={styles.bookingIdPill}>
            <Text style={styles.bookingIdText}>Booking ID {bookingId}</Text>
          </View>
        </View>

        {/* UPI Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>UPI</Text>
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        </View>

        <View style={styles.methodGroup}>
          {/* Google Pay */}
          <TouchableOpacity
            style={styles.methodRow}
            onPress={() => setSelectedUpi('GPAY')}
            activeOpacity={0.8}
          >
            <View style={[styles.upiIconBox, { backgroundColor: '#2563EB' }]}>
              <Text style={styles.upiIconText}>G</Text>
            </View>
            <Text style={styles.methodName}>Google Pay</Text>
            <View style={[styles.radioOuter, selectedUpi === 'GPAY' && styles.radioOuterSelected]}>
              {selectedUpi === 'GPAY' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* PhonePe */}
          <TouchableOpacity
            style={styles.methodRow}
            onPress={() => setSelectedUpi('PHONEPE')}
            activeOpacity={0.8}
          >
            <View style={[styles.upiIconBox, { backgroundColor: '#5B21B6', borderRadius: 16 }]}>
              <Text style={styles.upiIconText}>Pe</Text>
            </View>
            <Text style={styles.methodName}>PhonePe</Text>
            <View style={[styles.radioOuter, selectedUpi === 'PHONEPE' && styles.radioOuterSelected]}>
              {selectedUpi === 'PHONEPE' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Paytm */}
          <TouchableOpacity
            style={styles.methodRow}
            onPress={() => setSelectedUpi('PAYTM')}
            activeOpacity={0.8}
          >
            <View style={[styles.upiIconBox, { backgroundColor: '#0284C7', borderRadius: 16 }]}>
              <Text style={styles.upiIconText}>Pt</Text>
            </View>
            <Text style={styles.methodName}>Paytm</Text>
            <View style={[styles.radioOuter, selectedUpi === 'PAYTM' && styles.radioOuterSelected]}>
              {selectedUpi === 'PAYTM' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Add new UPI ID */}
          <TouchableOpacity
            style={styles.methodRow}
            onPress={() => setSelectedUpi('NEW_UPI')}
            activeOpacity={0.8}
          >
            <View style={[styles.upiIconBox, { backgroundColor: '#E3F6EA' }]}>
              <Text style={{ fontSize: 16, color: '#16A34A', fontWeight: '800' }}>+</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>Add new UPI ID</Text>
              <Text style={styles.methodSub}>name@bank</Text>
            </View>
            <View style={[styles.radioOuter, selectedUpi === 'NEW_UPI' && styles.radioOuterSelected]}>
              {selectedUpi === 'NEW_UPI' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* MORE WAYS TO PAY Section */}
        <Text style={[styles.sectionHeading, { marginTop: 22, marginBottom: 10 }]}>
          MORE WAYS TO PAY
        </Text>

        <View style={styles.methodGroup}>
          {/* Credit / Debit Card */}
          <TouchableOpacity style={styles.methodRow} activeOpacity={0.8} onPress={handlePay}>
            <View style={[styles.upiIconBox, { backgroundColor: '#1E293B' }]}>
              <Text style={{ fontSize: 16 }}>💳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>Credit / Debit Card</Text>
              <Text style={styles.methodSub}>Visa, Mastercard, RuPay</Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Net Banking */}
          <TouchableOpacity style={styles.methodRow} activeOpacity={0.8} onPress={handlePay}>
            <View style={[styles.upiIconBox, { backgroundColor: '#1E293B' }]}>
              <Text style={{ fontSize: 16 }}>🏦</Text>
            </View>
            <Text style={[styles.methodName, { flex: 1 }]}>Net Banking</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Wallets */}
          <TouchableOpacity style={styles.methodRow} activeOpacity={0.8} onPress={handlePay}>
            <View style={[styles.upiIconBox, { backgroundColor: '#1E293B' }]}>
              <Text style={{ fontSize: 16 }}>👛</Text>
            </View>
            <Text style={[styles.methodName, { flex: 1 }]}>Wallets</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePay}
          disabled={isProcessing}
          activeOpacity={0.9}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{displayAmount}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>🛡️ 100% secure payments</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    paddingHorizontal: 6,
  },
  backBtnText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F1F16',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1F16',
  },
  amountCard: {
    backgroundColor: '#0B4A27',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '600',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bookingIdPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bookingIdText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  recommendedBadge: {
    backgroundColor: '#0F4A24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  methodGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  upiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upiIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  methodName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F1F16',
    flex: 1,
  },
  methodSub: {
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#16A34A',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  payBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secureText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
});
