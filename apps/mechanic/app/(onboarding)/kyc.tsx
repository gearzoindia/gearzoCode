import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';
import { useSaveMechanicKyc } from '@gearzo/api-client';

export default function OnboardingKycScreen() {
  const router = useRouter();

  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [docsUploaded, setDocsUploaded] = useState<Record<string, boolean>>({
    aadharFront: false,
    aadharBack: false,
    panCard: false,
    drivingLicense: false,
    selfie: false,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const saveKycMutation = useSaveMechanicKyc();

  const toggleDoc = (key: string) => {
    setDocsUploaded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = async () => {
    setErrorMsg(null);
    const cleanAadhaar = aadharNumber.replace(/\s+/g, '');
    if (cleanAadhaar.length !== 12) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    const cleanPan = panNumber.trim().toUpperCase();
    if (cleanPan.length !== 10) {
      setErrorMsg('Please enter a valid 10-character PAN number.');
      return;
    }

    try {
      await saveKycMutation.mutateAsync({
        aadharNumber: cleanAadhaar,
        panNumber: cleanPan,
        documentUrl: 'https://cdn.gearzo.in/docs/kyc-verified-bundle.pdf',
      });
    } catch {
      // Proceed
    }

    router.push('/(onboarding)/bank');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: '80%' }]} />
        </View>
        <Text style={styles.stepCount}>Step 5 of 6: Government KYC Verification</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.title}>Government Identity Proofs</Text>
          <Text style={styles.subtitle}>
            GearZo is a secure platform. We verify all mechanics to protect customers and guarantee insurance coverage.
          </Text>

          <View style={{ marginTop: 20 }}>
            {/* Aadhaar Input */}
            <Input
              label="Aadhaar Card Number (12 Digits) *"
              placeholder="1234 5678 9012"
              keyboardType="number-pad"
              maxLength={14}
              value={aadharNumber}
              onChangeText={setAadharNumber}
            />

            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={[styles.uploadBox, docsUploaded.aadharFront && styles.uploadBoxDone]}
                onPress={() => toggleDoc('aadharFront')}
              >
                <Text style={styles.uploadIcon}>{docsUploaded.aadharFront ? '✅' : '📷'}</Text>
                <Text style={styles.uploadText}>Aadhaar Front</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, docsUploaded.aadharBack && styles.uploadBoxDone]}
                onPress={() => toggleDoc('aadharBack')}
              >
                <Text style={styles.uploadIcon}>{docsUploaded.aadharBack ? '✅' : '📷'}</Text>
                <Text style={styles.uploadText}>Aadhaar Back</Text>
              </TouchableOpacity>
            </View>

            {/* PAN Input */}
            <Input
              label="PAN Card Number (10 Characters) *"
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
              value={panNumber}
              onChangeText={setPanNumber}
            />

            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={[styles.uploadBox, docsUploaded.panCard && styles.uploadBoxDone]}
                onPress={() => toggleDoc('panCard')}
              >
                <Text style={styles.uploadIcon}>{docsUploaded.panCard ? '✅' : '📷'}</Text>
                <Text style={styles.uploadText}>PAN Card Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, docsUploaded.selfie && styles.uploadBoxDone]}
                onPress={() => toggleDoc('selfie')}
              >
                <Text style={styles.uploadIcon}>{docsUploaded.selfie ? '✅' : '🤳'}</Text>
                <Text style={styles.uploadText}>Live Selfie (KYC)</Text>
              </TouchableOpacity>
            </View>

            {/* Driving License */}
            <Input
              label="Driving License Number (DL)"
              placeholder="KA01 20180012345"
              autoCapitalize="characters"
              value={dlNumber}
              onChangeText={setDlNumber}
            />
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <View style={{ paddingTop: 24 }}>
          <Button
            title="Continue to Bank Payout Details →"
            variant="primary"
            size="lg"
            loading={saveKycMutation.isPending}
            onPress={handleContinue}
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
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadBox: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxDone: {
    borderColor: '#1B5E20',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 10,
  },
});
