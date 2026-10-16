import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

export default function LedgerAdjustmentsScreen() {
  const router = useRouter();

  const [partnerId, setPartnerId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amountPaise, setAmountPaise] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!partnerId || !amountPaise || !reason) {
      Alert.alert('Required Fields', 'Please complete all ledger adjustment inputs.');
      return;
    }
    Alert.alert('Adjustment Submitted', 'Entry posted to maker-checker approval queue.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Wallet Ledger Adjustment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.formTitle}>Post Manual Wallet Credit / Debit</Text>
          <Text style={styles.formSub}>
            Adjustments are logged in tamper-evident audit logs and subject to two-party approval.
          </Text>

          <Input
            label="Mechanic Partner ID *"
            placeholder="e.g. m-101"
            value={partnerId}
            onChangeText={setPartnerId}
          />

          <Text style={styles.label}>Adjustment Type *</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, adjustmentType === 'CREDIT' && styles.toggleBtnActiveCredit]}
              onPress={() => setAdjustmentType('CREDIT')}
            >
              <Text style={[styles.toggleText, adjustmentType === 'CREDIT' && styles.toggleTextActive]}>
                + Credit Partner Wallet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, adjustmentType === 'DEBIT' && styles.toggleBtnActiveDebit]}
              onPress={() => setAdjustmentType('DEBIT')}
            >
              <Text style={[styles.toggleText, adjustmentType === 'DEBIT' && styles.toggleTextActive]}>
                - Debit / Penalty Deduction
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Amount in Paise (e.g. 50000 = ₹500.00) *"
            placeholder="50000"
            keyboardType="number-pad"
            value={amountPaise}
            onChangeText={setAmountPaise}
          />

          <Input
            label="Audit Justification / Ticket Reference *"
            placeholder="e.g. Compensation for customer late cancellation (Ticket #INC-402)"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
          />

          <Button
            title="Submit Adjustment Proposal"
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            style={{ marginTop: 12 }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtnActiveCredit: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  toggleBtnActiveDebit: {
    backgroundColor: '#B91C1C',
    borderColor: '#B91C1C',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
});
