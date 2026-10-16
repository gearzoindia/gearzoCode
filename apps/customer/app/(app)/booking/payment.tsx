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
import { Card, Button, Badge } from '@gearzo/ui';

type PaymentMode = 'UPI_GPAY' | 'UPI_PHONEPE' | 'UPI_PAYTM' | 'CARD' | 'NET_BANKING' | 'PAY_LATER';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId: string; amountPaise: string }>();

  const bookingId = params.bookingId || `gz-${Date.now()}`;
  const amountPaise = parseInt(params.amountPaise || '123500', 10);

  const [selectedMode, setSelectedMode] = useState<PaymentMode>('UPI_GPAY');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);

    // Simulate payment gateway delay (1.5 seconds)
    setTimeout(() => {
      setIsProcessing(false);
      // Route to searching or confirmed
      router.replace({
        pathname: '/booking/confirmed',
        params: { bookingId, amountPaise: amountPaise.toString() },
      });
    }, 1500);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push({
        pathname: '/booking/payment-failed',
        params: { bookingId, amountPaise: amountPaise.toString() },
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Payment Method</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Payable Header Card */}
        <Card variant="elevated" style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Payable Amount</Text>
          <Text style={styles.amountValue}>
            ₹{(amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.bookingRef}>Order #{bookingId.slice(0, 10).toUpperCase()}</Text>
        </Card>

        {/* UPI Section (Recommended) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>UPI (Recommended & Instant)</Text>
          <Badge label="FASTEST" variant="success" />
        </View>

        <Card variant="default" style={styles.methodGroup}>
          <TouchableOpacity
            style={[styles.methodRow, selectedMode === 'UPI_GPAY' && styles.methodRowActive]}
            onPress={() => setSelectedMode('UPI_GPAY')}
          >
            <Text style={{ fontSize: 26, marginRight: 12 }}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Google Pay</Text>
              <Text style={styles.methodSub}>Pay directly with UPI linked account</Text>
            </View>
            <View style={[styles.radio, selectedMode === 'UPI_GPAY' && styles.radioActive]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.methodRow, selectedMode === 'UPI_PHONEPE' && styles.methodRowActive]}
            onPress={() => setSelectedMode('UPI_PHONEPE')}
          >
            <Text style={{ fontSize: 26, marginRight: 12 }}>🟣</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>PhonePe</Text>
              <Text style={styles.methodSub}>Instant UPI app payment</Text>
            </View>
            <View style={[styles.radio, selectedMode === 'UPI_PHONEPE' && styles.radioActive]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.methodRow, selectedMode === 'UPI_PAYTM' && styles.methodRowActive]}
            onPress={() => setSelectedMode('UPI_PAYTM')}
          >
            <Text style={{ fontSize: 26, marginRight: 12 }}>🔷</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Paytm UPI</Text>
              <Text style={styles.methodSub}>Pay using Paytm wallet or linked UPI</Text>
            </View>
            <View style={[styles.radio, selectedMode === 'UPI_PAYTM' && styles.radioActive]} />
          </TouchableOpacity>
        </Card>

        {/* Cards & Banking */}
        <Text style={styles.sectionHeader}>Cards & Net Banking</Text>
        <Card variant="default" style={styles.methodGroup}>
          <TouchableOpacity
            style={[styles.methodRow, selectedMode === 'CARD' && styles.methodRowActive]}
            onPress={() => setSelectedMode('CARD')}
          >
            <Text style={{ fontSize: 26, marginRight: 12 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Credit / Debit Card</Text>
              <Text style={styles.methodSub}>Visa, MasterCard, RuPay, Maestro</Text>
            </View>
            <View style={[styles.radio, selectedMode === 'CARD' && styles.radioActive]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.methodRow, selectedMode === 'NET_BANKING' && styles.methodRowActive]}
            onPress={() => setSelectedMode('NET_BANKING')}
          >
            <Text style={{ fontSize: 26, marginRight: 12 }}>🏦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Net Banking</Text>
              <Text style={styles.methodSub}>HDFC, SBI, ICICI, Axis & 50+ banks</Text>
            </View>
            <View style={[styles.radio, selectedMode === 'NET_BANKING' && styles.radioActive]} />
          </TouchableOpacity>
        </Card>

        {/* Pay After Service */}
        <Text style={styles.sectionHeader}>Pay on Delivery</Text>
        <Card variant="default" style={styles.methodGroup}>
          <TouchableOpacity
            style={[styles.methodRow, selectedMode === 'PAY_LATER' && styles.methodRowActive]}
            onPress={() => setSelectedMode('PAY_LATER')}
          >
            <Text style={{ fontSize: 26, marginRight: 12 }}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Pay After Service Completion</Text>
              <Text style={styles.methodSub}>
                Pay cash or UPI directly to technician once work is finished
              </Text>
            </View>
            <View style={[styles.radio, selectedMode === 'PAY_LATER' && styles.radioActive]} />
          </TouchableOpacity>
        </Card>

        {/* Test failure simulator for edge-case UX */}
        <TouchableOpacity
          style={styles.simulateFailLink}
          onPress={handleSimulateFailure}
        >
          <Text style={{ fontSize: 12, color: '#9CA3AF', textDecorationLine: 'underline' }}>
            Simulate Gateway Failure (Test UX)
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Pay CTA */}
      <View style={styles.bottomBar}>
        <Button
          title={isProcessing ? 'Processing Payment...' : `Pay ₹${(amountPaise / 100).toLocaleString('en-IN')}`}
          variant="primary"
          size="lg"
          loading={isProcessing}
          disabled={isProcessing}
          onPress={handlePay}
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
  amountCard: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  amountLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
    marginVertical: 4,
  },
  bookingRef: {
    fontSize: 12,
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 14,
    marginBottom: 8,
  },
  methodGroup: {
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  methodRowActive: {
    backgroundColor: '#F0FDF4',
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  methodSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioActive: {
    borderColor: '#1B5E20',
    backgroundColor: '#1B5E20',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 54,
  },
  simulateFailLink: {
    alignItems: 'center',
    marginVertical: 16,
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
  },
});
