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

  const displayName = user?.name || user?.phone || 'Customer';
  const initial = displayName.charAt(0).toUpperCase();
  const phoneStr = user?.phone || '';
  const maskedPhone = phoneStr
    ? phoneStr.length > 6
      ? phoneStr.slice(0, 4) + ' •••• ' + phoneStr.slice(-2)
      : phoneStr
    : 'No phone registered';
  const email = user?.email || 'No email registered';

  return (
    <View style={styles.container}>
      {/* Top Dark Green Curved Header */}
      <View style={styles.curvedHeader}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userPhone}>{maskedPhone}</Text>
              <Text style={styles.userEmail}>{email}</Text>
            </View>
            <View style={styles.avatarSquircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* 3 Quick Cards */}
        <View style={styles.quickCardsRow}>
          {/* Saved Address */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/addresses')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickCardIcon}>📍</Text>
            <Text style={styles.quickCardTitle}>Saved{'\n'}Address</Text>
          </TouchableOpacity>

          {/* Upcoming Services */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/profile/upcoming')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickCardIcon}>📅</Text>
            <Text style={styles.quickCardTitle}>Upcoming{'\n'}Services</Text>
          </TouchableOpacity>

          {/* Your Rewards */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/profile/rewards')}
            activeOpacity={0.8}
          >
            <View style={styles.comingSoonTag}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
            <Text style={styles.quickCardIcon}>🎁</Text>
            <Text style={styles.quickCardTitle}>Your{'\n'}Rewards</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuGroup}>
          {/* Order History */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(app)/(tabs)/bookings')}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuLabel}>Order History</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuLabel}>Settings</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Terms & Privacy */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/legal')}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>📑</Text>
            <Text style={styles.menuLabel}>Terms & Privacy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Help */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/help')}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuLabel}>Help</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.logoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  curvedHeader: {
    backgroundColor: '#0B4A27',
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 11.5,
    color: '#A7F3D0',
    fontWeight: '500',
  },
  avatarSquircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0B4A27',
  },
  quickCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 106,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  comingSoonTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
  },
  comingSoonText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickCardIcon: {
    fontSize: 20,
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1F16',
    lineHeight: 16,
  },
  menuGroup: {
    gap: 10,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F1F16',
    flex: 1,
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
});
