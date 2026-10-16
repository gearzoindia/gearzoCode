import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@gearzo/api-client';
import { Avatar, Card, Badge } from '@gearzo/ui';

export default function MechanicProfileTab() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of GearZo Partner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header User Card */}
        <View style={styles.userHeader}>
          <Avatar name={user?.name || 'Ramesh Kumar'} size="lg" />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.userName}>{user?.name || 'Ramesh Kumar'}</Text>
              <Badge label="VERIFIED" variant="success" />
            </View>
            <Text style={styles.userPhone}>{user?.phone || '+91 98765 43210'}</Text>
            <Text style={styles.userRole}>Independent Mobile Mechanic • 5 yrs exp</Text>
          </View>
        </View>

        {/* Operating Area & Stats */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Card variant="default" style={styles.metricsCard}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>4.9 ⭐</Text>
              <Text style={styles.metricLabel}>Lifetime Rating</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>342</Text>
              <Text style={styles.metricLabel}>Jobs Done</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>98%</Text>
              <Text style={styles.metricLabel}>On-Time Arrival</Text>
            </View>
          </Card>

          {/* Partner Controls */}
          <Text style={styles.sectionHeader}>Partner Settings</Text>
          <Card variant="default" style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/availability')}
            >
              <Text style={styles.menuIcon}>📅</Text>
              <Text style={styles.menuText}>Working Hours & Leave Calendar</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(onboarding)/skills')}
            >
              <Text style={styles.menuIcon}>🧰</Text>
              <Text style={styles.menuText}>Skills, Services & Toolsets</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(onboarding)/location')}
            >
              <Text style={styles.menuIcon}>📍</Text>
              <Text style={styles.menuText}>Operating Base & Radius (5 km)</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(onboarding)/bank')}
            >
              <Text style={styles.menuIcon}>🏦</Text>
              <Text style={styles.menuText}>Bank Payout Account</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </Card>

          <Text style={styles.sectionHeader}>Documents & Legal</Text>
          <Card variant="default" style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(onboarding)/kyc')}
            >
              <Text style={styles.menuIcon}>🪪</Text>
              <Text style={styles.menuText}>KYC Documents (Aadhaar & PAN)</Text>
              <Badge label="APPROVED" variant="success" />
            </TouchableOpacity>
          </Card>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out from GearZo Partner</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>GearZo Mechanic Partner App v1.0.0</Text>
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  userPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
    marginTop: 2,
  },
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  vDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  menuCard: {
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 46,
  },
  logoutBtn: {
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 16,
  },
});
