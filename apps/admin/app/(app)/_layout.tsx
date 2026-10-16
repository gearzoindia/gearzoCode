import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@gearzo/api-client';
import { Avatar, Badge } from '@gearzo/ui';

interface NavItem {
  name: string;
  route: string;
  icon: string;
  isSuperAdminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', route: '/dashboard', icon: '📊' },
  { name: 'Live Map', route: '/live-map', icon: '📍' },
  { name: 'Bookings', route: '/bookings', icon: '📋' },
  { name: 'Mechanics', route: '/mechanics', icon: '👨‍🔧' },
  { name: 'KYC Queue', route: '/mechanics/kyc-queue', icon: '🪪' },
  { name: 'Customers', route: '/customers', icon: '👥' },
  { name: 'Disputes', route: '/disputes', icon: '⚠️' },
  { name: 'Finance & Payouts', route: '/finance/payouts', icon: '💳' },
  { name: 'Refunds', route: '/finance/refunds', icon: '↩️' },
  { name: 'Approvals', route: '/approvals', icon: '✅' },
  { name: 'Admins & Staff', route: '/admins', icon: '🛡️' },
  { name: 'Reports & Exports', route: '/reports', icon: '📈' },
  { name: 'Broadcasts', route: '/broadcasts', icon: '📢' },
  { name: 'Audit Logs', route: '/audit-logs', icon: '📜' },
  { name: 'Jurisdictions', route: '/super/jurisdictions', icon: '🗺️', isSuperAdminOnly: true },
  { name: 'Catalogue & Services', route: '/super/catalogue', icon: '📦', isSuperAdminOnly: true },
  { name: 'Pricing & Surge', route: '/super/pricing', icon: '🏷️', isSuperAdminOnly: true },
  { name: 'Vehicles Master', route: '/super/vehicles-master', icon: '🚗', isSuperAdminOnly: true },
  { name: 'Commission Tiers', route: '/super/commission', icon: '💰', isSuperAdminOnly: true },
  { name: 'Fees & Taxes', route: '/super/fees', icon: '⚖️', isSuperAdminOnly: true },
  { name: 'Feature Flags', route: '/super/feature-flags', icon: '🚩', isSuperAdminOnly: true },
  { name: 'App Versions', route: '/super/app-versions', icon: '📱', isSuperAdminOnly: true },
  { name: 'Legal Documents', route: '/super/legal-docs', icon: '📄', isSuperAdminOnly: true },
  { name: 'Global Settings', route: '/super/settings', icon: '⚙️', isSuperAdminOnly: true },
  { name: 'System Health', route: '/super/system-health', icon: '🖥️', isSuperAdminOnly: true },
];

export default function AdminAppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();

  const isDesktop = width >= 768;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || true; // allow all in management portal

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Sidebar on Desktop / Tablet */}
      {isDesktop && (
        <View style={styles.sidebar}>
          {/* Logo Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>GearZo Admin</Text>
              <Text style={styles.brandVersion}>Operations Portal</Text>
            </View>
          </View>

          {/* Navigation Items List */}
          <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
            <Text style={styles.navSectionHeader}>Core Operations</Text>
            {NAV_ITEMS.filter((item) => !item.isSuperAdminOnly).map((item) => {
              const isActive = pathname.startsWith(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Text style={{ fontSize: 16, marginRight: 10 }}>{item.icon}</Text>
                  <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {isSuperAdmin && (
              <>
                <Text style={styles.navSectionHeader}>Super Admin Master</Text>
                {NAV_ITEMS.filter((item) => item.isSuperAdminOnly).map((item) => {
                  const isActive = pathname.startsWith(item.route);
                  return (
                    <TouchableOpacity
                      key={item.route}
                      style={[styles.navItem, isActive && styles.navItemActive]}
                      onPress={() => router.push(item.route as any)}
                    >
                      <Text style={{ fontSize: 16, marginRight: 10 }}>{item.icon}</Text>
                      <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>

          {/* User Footer Card */}
          <View style={styles.sidebarFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Avatar name={user?.name || 'Admin'} size="sm" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.footerUserName} numberOfLines={1}>
                  {user?.name || 'Ops Manager'}
                </Text>
                <Text style={styles.footerUserRole}>{user?.role || 'SUPER_ADMIN'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign Out ⎋</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content View with Stack Router */}
      <View style={styles.mainContent}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: { backgroundColor: '#F8FAFC' },
          }}
        >
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="live-map" />
          <Stack.Screen name="bookings/index" />
          <Stack.Screen name="bookings/[id]" />
          <Stack.Screen name="mechanics/index" />
          <Stack.Screen name="mechanics/[id]" />
          <Stack.Screen name="mechanics/kyc-queue" />
          <Stack.Screen name="mechanics/kyc/[mechanicId]" />
          <Stack.Screen name="customers/index" />
          <Stack.Screen name="customers/[id]" />
          <Stack.Screen name="disputes/index" />
          <Stack.Screen name="disputes/[id]" />
          <Stack.Screen name="finance/refunds" />
          <Stack.Screen name="finance/payouts" />
          <Stack.Screen name="finance/payouts/[runId]" />
          <Stack.Screen name="finance/ledger-adjustments" />
          <Stack.Screen name="approvals/index" />
          <Stack.Screen name="admins/index" />
          <Stack.Screen name="admins/invite" />
          <Stack.Screen name="admins/[id]" />
          <Stack.Screen name="reports/index" />
          <Stack.Screen name="reports/exports" />
          <Stack.Screen name="broadcasts/index" />
          <Stack.Screen name="broadcasts/new" />
          <Stack.Screen name="audit-logs" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="profile/sessions" />
          <Stack.Screen name="profile/security" />
          <Stack.Screen name="super/jurisdictions" />
          <Stack.Screen name="super/catalogue" />
          <Stack.Screen name="super/pricing" />
          <Stack.Screen name="super/vehicles-master" />
          <Stack.Screen name="super/commission" />
          <Stack.Screen name="super/fees" />
          <Stack.Screen name="super/settings" />
          <Stack.Screen name="super/feature-flags" />
          <Stack.Screen name="super/app-versions" />
          <Stack.Screen name="super/legal-docs" />
          <Stack.Screen name="super/system-health" />
        </Stack>

        {/* Bottom Bar for Mobile Only */}
        {!isDesktop && (
          <View style={styles.mobileTabBar}>
            <TouchableOpacity
              style={styles.mobileTabItem}
              onPress={() => router.push('/dashboard')}
            >
              <Text style={{ fontSize: 20 }}>📊</Text>
              <Text style={styles.mobileTabLabel}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileTabItem}
              onPress={() => router.push('/live-map')}
            >
              <Text style={{ fontSize: 20 }}>📍</Text>
              <Text style={styles.mobileTabLabel}>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileTabItem}
              onPress={() => router.push('/bookings')}
            >
              <Text style={{ fontSize: 20 }}>📋</Text>
              <Text style={styles.mobileTabLabel}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileTabItem}
              onPress={() => router.push('/mechanics/kyc-queue')}
            >
              <Text style={{ fontSize: 20 }}>🪪</Text>
              <Text style={styles.mobileTabLabel}>KYC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileTabItem}
              onPress={() => router.push('/super/system-health')}
            >
              <Text style={{ fontSize: 20 }}>⚙️</Text>
              <Text style={styles.mobileTabLabel}>More</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F172A',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#0F172A',
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    display: 'flex',
    flexDirection: 'column',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  brandVersion: {
    fontSize: 11,
    color: '#64748B',
  },
  navList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  navSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginVertical: 10,
    paddingLeft: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: '#1E293B',
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  navItemTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  footerUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  footerUserRole: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  logoutBtn: {
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mobileTabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mobileTabItem: {
    alignItems: 'center',
  },
  mobileTabLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
});
