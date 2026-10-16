import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Badge } from '@gearzo/ui';
import { useMechanicOnboardingState } from '@gearzo/api-client';

export default function UnderReviewScreen() {
  const router = useRouter();
  const { data: onboardingState, refetch, isFetching } = useMechanicOnboardingState();

  const handleCheckStatus = async () => {
    const res = await refetch();
    if (res.data?.step === 'APPROVED') {
      router.replace('/(app)/(tabs)');
    } else if (res.data?.step === 'REJECTED') {
      router.replace('/(onboarding)/rejected');
    }
  };

  const handleDevApprove = () => {
    router.replace('/(app)/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 44 }}>⏳</Text>
        </View>

        <Badge label="VERIFICATION IN PROGRESS" variant="warning" />

        <Text style={styles.title}>Application Under Review</Text>
        <Text style={styles.desc}>
          Thank you for applying to GearZo Partner! Our onboarding verification team is inspecting your Aadhaar, PAN, and skill documents.
        </Text>

        <Card variant="default" style={styles.infoCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Typical Approval Time</Text>
            <Text style={styles.value}>4 to 12 Hours</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Notification Mode</Text>
            <Text style={styles.value}>SMS & WhatsApp Alert</Text>
          </View>
        </Card>

        <View style={{ width: '100%', gap: 12 }}>
          <Button
            title="Refresh Verification Status"
            variant="outline"
            size="lg"
            loading={isFetching}
            onPress={handleCheckStatus}
          />

          <Button
            title="Simulate Approval & Enter App →"
            variant="primary"
            size="md"
            onPress={handleDevApprove}
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
    backgroundColor: '#FEF3C7',
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
  infoCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
});
