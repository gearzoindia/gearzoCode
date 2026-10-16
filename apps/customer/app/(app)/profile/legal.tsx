import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@gearzo/ui';

export default function LegalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="default" style={{ padding: 18, borderRadius: 12, marginBottom: 16 }}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.body}>
            1. Service Fulfillment: GearZo acts as a managed technology marketplace connecting vehicle owners with vetted, independent service mechanics.{'\n\n'}
            2. Upfront Pricing & Estimates: All platform quotes reflect standardized labor costs. Any additional spare parts required beyond standard package inclusions are subject to customer in-app approval before installation.{'\n\n'}
            3. Warranty: We guarantee all scheduled services for 30 days or 1,000 km, whichever comes first. Issues resulting from accidental damages or external misuse are excluded.{'\n\n'}
            4. Cancellation Policy: Free cancellation is permitted prior to mechanic dispatch. A nominal convenience fee applies if cancelled once the mechanic is within 1 km.
          </Text>
        </Card>

        <Card variant="default" style={{ padding: 18, borderRadius: 12 }}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.body}>
            We value your privacy. GearZo collects phone numbers, user addresses, and device location exclusively to dispatch technicians and calculate accurate arrival estimates.{'\n\n'}
            We never share or monetize your private contact data with third-party advertisers. All location permissions can be toggled via your operating system settings.
          </Text>
        </Card>
      </ScrollView>
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
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
});
