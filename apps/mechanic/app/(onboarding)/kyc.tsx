import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, Card } from '@gearzo/ui';
import { useSaveMechanicKyc } from '@gearzo/api-client';

interface UploadedDoc {
  uri: string;
  fileName: string;
  docType: string;
}

export default function OnboardingKycScreen() {
  const router = useRouter();

  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [docs, setDocs] = useState<Record<string, UploadedDoc>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const saveKycMutation = useSaveMechanicKyc();

  const pickDocument = async (key: string, docType: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `${key}_${Date.now()}.jpg`;
        setDocs((prev) => ({
          ...prev,
          [key]: {
            uri: asset.uri,
            fileName,
            docType,
          },
        }));
        setErrorMsg(null);
      }
    } catch (err: any) {
      console.warn('Failed to pick document:', err);
    }
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

    const documents = Object.entries(docs).map(([key, d]) => ({
      docType: d.docType,
      fileKey: `kyc/${key}_${Date.now()}_${d.fileName}`,
      numberLast4: d.docType.includes('AADHAAR')
        ? cleanAadhaar.slice(-4)
        : d.docType === 'PAN'
        ? cleanPan.slice(-4)
        : undefined,
    }));

    try {
      await saveKycMutation.mutateAsync({
        aadharNumber: cleanAadhaar,
        panNumber: cleanPan,
        dlNumber: dlNumber.trim() || undefined,
        documents,
      });
      router.push('/(onboarding)/bank');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save KYC documents. Please try again.';
      setErrorMsg(msg);
    }
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
            GearZo is a secure platform. Please upload your identity documents to complete partner verification.
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
                style={[styles.uploadBox, docs.aadharFront && styles.uploadBoxDone]}
                onPress={() => pickDocument('aadharFront', 'AADHAAR_FRONT')}
              >
                {docs.aadharFront?.uri ? (
                  <Image source={{ uri: docs.aadharFront.uri }} style={styles.thumbImage} />
                ) : (
                  <Text style={styles.uploadIcon}>📷</Text>
                )}
                <Text style={styles.uploadText} numberOfLines={1}>
                  {docs.aadharFront ? '✓ Aadhaar Front' : 'Upload Aadhaar Front'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, docs.aadharBack && styles.uploadBoxDone]}
                onPress={() => pickDocument('aadharBack', 'AADHAAR_BACK')}
              >
                {docs.aadharBack?.uri ? (
                  <Image source={{ uri: docs.aadharBack.uri }} style={styles.thumbImage} />
                ) : (
                  <Text style={styles.uploadIcon}>📷</Text>
                )}
                <Text style={styles.uploadText} numberOfLines={1}>
                  {docs.aadharBack ? '✓ Aadhaar Back' : 'Upload Aadhaar Back'}
                </Text>
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
                style={[styles.uploadBox, docs.panCard && styles.uploadBoxDone]}
                onPress={() => pickDocument('panCard', 'PAN')}
              >
                {docs.panCard?.uri ? (
                  <Image source={{ uri: docs.panCard.uri }} style={styles.thumbImage} />
                ) : (
                  <Text style={styles.uploadIcon}>📷</Text>
                )}
                <Text style={styles.uploadText} numberOfLines={1}>
                  {docs.panCard ? '✓ PAN Card' : 'Upload PAN Card'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, docs.selfie && styles.uploadBoxDone]}
                onPress={() => pickDocument('selfie', 'SELFIE_WITH_ID')}
              >
                {docs.selfie?.uri ? (
                  <Image source={{ uri: docs.selfie.uri }} style={styles.thumbImage} />
                ) : (
                  <Text style={styles.uploadIcon}>🤳</Text>
                )}
                <Text style={styles.uploadText} numberOfLines={1}>
                  {docs.selfie ? '✓ Live Selfie' : 'Upload Live Selfie'}
                </Text>
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

            <TouchableOpacity
              style={[styles.uploadBox, styles.dlUploadBox, docs.drivingLicense && styles.uploadBoxDone]}
              onPress={() => pickDocument('drivingLicense', 'DRIVING_LICENCE')}
            >
              {docs.drivingLicense?.uri ? (
                <Image source={{ uri: docs.drivingLicense.uri }} style={styles.thumbImage} />
              ) : (
                <Text style={styles.uploadIcon}>🪪</Text>
              )}
              <Text style={styles.uploadText} numberOfLines={1}>
                {docs.drivingLicense ? '✓ Driving License Uploaded' : 'Upload Driving License Photo (Optional)'}
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  dlUploadBox: {
    marginBottom: 16,
  },
  uploadBoxDone: {
    borderColor: '#1B5E20',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  thumbImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
});
