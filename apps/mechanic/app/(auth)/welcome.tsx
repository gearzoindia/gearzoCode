import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@gearzo/ui';

export default function MechanicWelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 32 }}>
        <View />

        {/* Center Hero */}
        <View style={{ alignItems: 'center' }}>
          <View style={styles.logoWrap}>
            <Text style={{ fontSize: 44 }}>🔧</Text>
          </View>
          <Text style={styles.brandTitle}>GearZo Partner</Text>
          <Text style={styles.brandSub}>Earn More. Work on Your Own Schedule.</Text>

          <View style={styles.perksCard}>
            <View style={styles.perkRow}>
              <Text style={styles.perkIcon}>💰</Text>
              <Text style={styles.perkText}>Guaranteed timely payouts directly to your bank account</Text>
            </View>
            <View style={styles.perkRow}>
              <Text style={styles.perkIcon}>📍</Text>
              <Text style={styles.perkText}>Flexible work radius within 3 to 10 km of your garage</Text>
            </View>
            <View style={styles.perkRow}>
              <Text style={styles.perkIcon}>🛡️</Text>
              <Text style={styles.perkText}>Platform insurance & 24/7 dedicated partner helpline</Text>
            </View>
          </View>
        </View>

        {/* Action */}
        <View>
          <Button
            title="Register as Mechanic / Partner"
            variant="secondary"
            size="lg"
            style={{ backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16 }}
            textStyle={{ color: '#1B5E20', fontWeight: '800' }}
            onPress={() => router.push('/(auth)/phone')}
          />

          <Text style={styles.termsText}>
            By continuing, you agree to GearZo's Partner Terms of Service & Verification Standards.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 15,
    fontWeight: '500',
    color: '#A5D6A7',
    marginTop: 6,
    textAlign: 'center',
  },
  perksCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  perkText: {
    fontSize: 13,
    color: '#E8F5E9',
    flex: 1,
    lineHeight: 18,
  },
  termsText: {
    fontSize: 11,
    color: '#C8E6C9',
    textAlign: 'center',
    lineHeight: 16,
  },
});
