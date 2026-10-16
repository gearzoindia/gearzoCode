import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '@gearzo/ui';

export default function HelpScreen() {
  const router = useRouter();

  const handleCallSupport = () => {
    Linking.openURL('tel:+9118001234567');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gearzo.in');
  };

  const faqs = [
    {
      q: 'How does doorstep servicing work?',
      a: 'Our certified mobile mechanic travels to your home or office equipped with tools, OEM fluids, and inspection gear. Work is conducted right at your parking spot.',
    },
    {
      q: 'What if additional parts need replacement?',
      a: 'The technician inspects the vehicle and sends an in-app proposal with transparent pricing. You can approve or decline with a single tap.',
    },
    {
      q: 'What does the 1,000 km warranty cover?',
      a: 'Any workmanship faults or fluid leaks connected to the completed service within 30 days are rectified free of cost.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Contact Support Cards */}
        <Card variant="elevated" style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Immediate Assistance?</Text>
          <Text style={styles.supportSub}>Our 24/7 Roadside & Service dispatch team is ready to help.</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
            <Button
              title="Call Helpline"
              variant="primary"
              size="sm"
              onPress={handleCallSupport}
              style={{ flex: 1 }}
            />
            <Button
              title="Email Support"
              variant="outline"
              size="sm"
              onPress={handleEmailSupport}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* FAQs */}
        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
        <View style={{ gap: 12 }}>
          {faqs.map((faq, i) => (
            <Card key={i} variant="default" style={{ padding: 16, borderRadius: 12 }}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqA}>{faq.a}</Text>
            </Card>
          ))}
        </View>
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
  supportCard: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  supportSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  faqA: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});
