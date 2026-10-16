import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@gearzo/api-client';
import { Avatar, Card, Badge } from '@gearzo/ui';

export default function ProfileTab() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out of GearZo?');
      if (confirmed) {
        await signOut();
        router.replace('/(auth)/welcome');
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of GearZo?', [
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
    }
  };

  const maskedPhone = user?.phone
    ? user.phone.slice(0, 5) + '••••' + user.phone.slice(-3)
    : '+91 ••••• •••••';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header User Card */}
        <View style={styles.userHeader}>
          <Avatar name={user?.name || 'Customer'} size="lg" />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.userName}>{user?.name || 'GearZo Driver'}</Text>
            <Text style={styles.userPhone}>{maskedPhone}</Text>
            {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push('/profile/edit')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={{ fontSize: 16 }}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tiles */}
        <View style={styles.quickTilesRow}>
          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/addresses')}
            accessibilityRole="button"
          >
            <Text style={styles.quickTileIcon}>📍</Text>
            <Text style={styles.quickTileTitle}>Saved Addresses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/profile/upcoming')}
            accessibilityRole="button"
          >
            <Text style={styles.quickTileIcon}>⏱️</Text>
            <Text style={styles.quickTileTitle}>Upcoming Services</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickTile, { opacity: 0.85 }]}
            onPress={() => router.push('/profile/rewards')}
            accessibilityRole="button"
          >
            <View style={styles.soonBadge}>
              <Badge label="Soon" variant="neutral" />
            </View>
            <Text style={styles.quickTileIcon}>🎁</Text>
            <Text style={styles.quickTileTitle}>Rewards & Cash</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.sectionHeader}>Account & Preferences</Text>
          <Card variant="default" style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/profile/order-history')}
            >
              <Text style={styles.menuIcon}>📜</Text>
              <Text style={styles.menuText}>Order History</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/profile/edit')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Personal Details</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/profile/settings')}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>App Settings & Notifications</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </Card>

          <Text style={styles.sectionHeader}>Support & Legal</Text>
          <Card variant="default" style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/profile/help')}
            >
              <Text style={styles.menuIcon}>💬</Text>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/profile/legal')}
            >
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuText}>Terms of Service & Privacy</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </Card>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out of account"
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>GearZo Customer App v1.0.0 (Expo SDK 52)</Text>
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
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTilesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quickTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  quickTileIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickTileTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  soonBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
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
    fontSize: 15,
    fontWeight: '500',
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
  logoutButton: {
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 18,
    marginBottom: 8,
  },
});
