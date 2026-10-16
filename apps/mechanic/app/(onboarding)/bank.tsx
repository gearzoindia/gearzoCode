import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';
import { useSaveMechanicBank } from '@gearzo/api-client';

export default function OnboardingBankScreen() {
  const router = useRouter();

  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saveBankMutation = useSaveMechanicBank();

  const handleFinish = async () => {
    setErrorMsg(null);
    if (!holderName.trim()) {
      setErrorMsg('Account holder name is required.');
      return;
    }
    if (accountNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid bank account number.');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setErrorMsg('Account numbers do not match.');
      return;
    }
    if (ifscCode.trim().length !== 11) {
      setErrorMsg('IFSC code must be exactly 11 characters (e.g. HDFC0001234).');
      return;
    }

    try {
      await saveBankMutation.mutateAsync({
        accountHolderName: holderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        upiId: upiId.trim() || undefined,
      });
    } catch {
      // Proceed
    }

    router.replace('/(onboarding)/under-review');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>
        <Text style={styles.stepCount}>Step 6 of 6: Bank & Payout Information</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.title}>Bank Payout Setup</Text>
          <Text style={styles.subtitle}>
            Your daily and weekly job earnings will be deposited directly to this account via IMPS/NEFT.
          </Text>

          <Card variant="default" style={styles.secureCard}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>🔒</Text>
            <Text style={styles.secureText}>
              Bank details are encrypted using 256-bit AES standards and used solely for payout credits.
            </Text>
          </Card>

          <View style={{ marginTop: 20 }}>
            <Input
              label="Account Holder Name *"
              placeholder="e.g. Ramesh Kumar"
              value={holderName}
              onChangeText={setHolderName}
            />

            <Input
              label="Bank Account Number *"
              placeholder="9876543210123"
              keyboardType="number-pad"
              secureTextEntry
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Input
              label="Confirm Bank Account Number *"
              placeholder="9876543210123"
              keyboardType="number-pad"
              value={confirmAccountNumber}
              onChangeText={setConfirmAccountNumber}
            />

            <Input
              label="IFSC Code (11 characters) *"
              placeholder="HDFC0001234"
              autoCapitalize="characters"
              maxLength={11}
              value={ifscCode}
              onChangeText={setIfscCode}
            />

            <Input
              label="UPI ID / VPA (Optional)"
              placeholder="ramesh@upi"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <View style={{ paddingTop: 24 }}>
          <Button
            title="Submit Application for Verification"
            variant="primary"
            size="lg"
            loading={saveBankMutation.isPending}
            onPress={handleFinish}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1B5E20',
  },
  stepCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  secureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  secureText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 10,
  },
});
