import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Badge } from '@gearzo/ui';

export default function OnboardingRejectedScreen() {
  const router = useRouter();

  const rejectionReasons = [
    'Uploaded Aadhaar photo was blurry and corner numbers were not readable.',
    'Name on PAN card did not match registered bank account holder name.',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 44 }}>⚠️</Text>
        </View>

        <Badge label="RE-SUBMISSION REQUIRED" variant="error" />

        <Text style={styles.title}>Application Needs Correction</Text>
        <Text style={styles.desc}>
          Our verification team noticed discrepancies in the documents you submitted. Please review the notes below and re-upload clear copies.
        </Text>

        <Card variant="default" style={styles.reasonsCard}>
          <Text style={styles.reasonsHeader}>Review Feedback:</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {rejectionReasons.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ color: '#DC2626', marginRight: 6 }}>•</Text>
                <Text style={styles.reasonText}>{r}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ width: '100%', gap: 12 }}>
          <Button
            title="Re-Upload KYC Documents"
            variant="primary"
            size="lg"
            onPress={() => router.replace('/(onboarding)/kyc')}
          />

          <Button
            title="Contact Support"
            variant="ghost"
            size="md"
            onPress={() => router.replace('/(auth)/welcome')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  reasonsCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    marginBottom: 32,
  },
  reasonsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  reasonText: {
    fontSize: 13,
    color: '#7F1D1D',
    flex: 1,
    lineHeight: 18,
  },
});
