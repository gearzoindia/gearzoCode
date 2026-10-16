import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input } from '@gearzo/ui';

export interface AppVersionConfig {
  id: string;
  appKey: 'customer' | 'mechanic' | 'admin';
  appName: string;
  platforms: string[];
  bundleId: string;
  currentLiveVersion: string;
  minSupportedVersion: string;
  isForceUpdateEnabled: boolean;
  storeUrlAndroid: string;
  storeUrlIos: string;
  releaseNotes: string;
  lastUpdated: string;
  activeInstallsEst: number;
  outdatedInstallsEst: number;
}

const INITIAL_CONFIGS: AppVersionConfig[] = [
  {
    id: 'ver-cust',
    appKey: 'customer',
    appName: 'GearZo Customer Mobile App',
    platforms: ['Android', 'iOS'],
    bundleId: 'com.gearzo.customer',
    currentLiveVersion: '2.4.2',
    minSupportedVersion: '2.1.0',
    isForceUpdateEnabled: true,
    storeUrlAndroid: 'https://play.google.com/store/apps/details?id=com.gearzo.customer',
    storeUrlIos: 'https://apps.apple.com/app/gearzo-customer/id6470001',
    releaseNotes:
      'Added live mechanic GPS route simulation, UPI autopay refunds, and multi-vehicle garage switcher.',
    lastUpdated: '2026-10-10T12:00:00Z',
    activeInstallsEst: 142500,
    outdatedInstallsEst: 3200,
  },
  {
    id: 'ver-mech',
    appKey: 'mechanic',
    appName: 'GearZo Mechanic Partner App',
    platforms: ['Android'],
    bundleId: 'com.gearzo.mechanic',
    currentLiveVersion: '1.9.8',
    minSupportedVersion: '1.8.0',
    isForceUpdateEnabled: true,
    storeUrlAndroid: 'https://play.google.com/store/apps/details?id=com.gearzo.mechanic',
    storeUrlIos: '',
    releaseNotes:
      'Background radar beacon battery optimization, camera proof offline cache, and instant IMPS settlement.',
    lastUpdated: '2026-10-11T16:30:00Z',
    activeInstallsEst: 8400,
    outdatedInstallsEst: 145,
  },
  {
    id: 'ver-admin',
    appKey: 'admin',
    appName: 'GearZo Admin Operations Portal',
    platforms: ['Web', 'Android Tablet'],
    bundleId: 'com.gearzo.admin',
    currentLiveVersion: '3.1.0',
    minSupportedVersion: '3.0.0',
    isForceUpdateEnabled: false,
    storeUrlAndroid: 'https://admin.gearzo.in',
    storeUrlIos: '',
    releaseNotes:
      'Maker-checker approval queue, dispute split refund calculator, PostGIS live fleet radar view.',
    lastUpdated: '2026-10-12T09:00:00Z',
    activeInstallsEst: 42,
    outdatedInstallsEst: 0,
  },
];

export default function AppVersionsScreen() {
  const router = useRouter();
  const [configs, setConfigs] = useState<AppVersionConfig[]>(INITIAL_CONFIGS);
  const [editingConfig, setEditingConfig] = useState<AppVersionConfig | null>(null);

  const toggleForceUpdate = (id: string) => {
    setConfigs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isForceUpdateEnabled: !item.isForceUpdateEnabled,
              lastUpdated: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const handleSaveModal = (updated: AppVersionConfig) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...updated, lastUpdated: new Date().toISOString() } : c))
    );
    setEditingConfig(null);
    Alert.alert(
      'Version Policy Published',
      `App version rules for ${updated.appName} synced to client boot configuration.`
    );
  };

  const handleBroadcastUpdate = (config: AppVersionConfig) => {
    Alert.alert(
      'Push Notification Broadcast',
      `Trigger "Update Available (v${config.currentLiveVersion})" push message to approximately ${config.outdatedInstallsEst} outdated devices?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Broadcast',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Broadcast Sent', `Notified ${config.outdatedInstallsEst} devices via Firebase Cloud Messaging.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Client App Version Enforcement</Text>
          <Text style={styles.sub}>
            Force-update cutoff gates, minimum supported semvers, and release distribution links
          </Text>
        </View>

        <Button
          title="Refresh Remote Config 🔄"
          variant="outline"
          size="sm"
          onPress={() => Alert.alert('Synced', 'Fetched latest bundle manifest from storage bucket.')}
        />
      </View>

      <FlatList
        data={configs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card variant="default" style={styles.card}>
            {/* Top row with name, platforms, and bundle */}
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.appName}>{item.appName}</Text>
                  {item.platforms.map((p) => (
                    <Badge key={p} label={p} variant="info" />
                  ))}
                </View>
                <Text style={styles.bundleText}>
                  Identifier: <Text style={{ fontFamily: 'monospace' }}>{item.bundleId}</Text>
                </Text>
              </View>

              <View style={styles.forceUpdateCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.forceLabel}>Force Update Gate</Text>
                  <Switch
                    value={item.isForceUpdateEnabled}
                    onValueChange={() => toggleForceUpdate(item.id)}
                    trackColor={{ true: '#DC2626', false: '#CBD5E1' }}
                  />
                </View>
                <Text
                  style={[
                    styles.forceStatus,
                    { color: item.isForceUpdateEnabled ? '#DC2626' : '#64748B' },
                  ]}
                >
                  {item.isForceUpdateEnabled ? 'BLOCKS OUTDATED APPS' : 'SOFT PROMPT ONLY'}
                </Text>
              </View>
            </View>

            {/* Version comparison row */}
            <View style={styles.versionGrid}>
              <View style={styles.versionBox}>
                <Text style={styles.vBoxLabel}>CURRENT LATEST RELEASE</Text>
                <Text style={styles.vBoxValue}>v{item.currentLiveVersion}</Text>
                <Text style={styles.vBoxSub}>Live on App Stores</Text>
              </View>

              <View style={styles.versionBox}>
                <Text style={styles.vBoxLabel}>MINIMUM SUPPORTED</Text>
                <Text style={[styles.vBoxValue, { color: '#DC2626' }]}>v{item.minSupportedVersion}</Text>
                <Text style={styles.vBoxSub}>Below this requires hard update</Text>
              </View>

              <View style={styles.versionBox}>
                <Text style={styles.vBoxLabel}>ESTIMATED FLEET REACH</Text>
                <Text style={[styles.vBoxValue, { color: '#16A34A' }]}>
                  {item.activeInstallsEst.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.vBoxSub}>{item.outdatedInstallsEst} devices require update</Text>
              </View>
            </View>

            {/* Release notes summary */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Latest Changelog / Release Notes:</Text>
              <Text style={styles.notesBody}>{item.releaseNotes}</Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Text style={styles.updatedAt}>
                  Last Policy Sync: {new Date(item.lastUpdated).toLocaleString()}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {item.outdatedInstallsEst > 0 && (
                  <Button
                    title="Send FCM Update Push 📢"
                    variant="outline"
                    size="sm"
                    onPress={() => handleBroadcastUpdate(item)}
                  />
                )}
                <Button
                  title="Configure Semver Policy ⚙️"
                  variant="primary"
                  size="sm"
                  onPress={() => setEditingConfig(item)}
                />
              </View>
            </View>
          </Card>
        )}
      />

      {/* Edit Version Config Modal */}
      {editingConfig && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Configure App Version Enforcement</Text>
              <Text style={styles.modalSub}>{editingConfig.appName} ({editingConfig.bundleId})</Text>

              <ScrollView style={{ maxHeight: 440 }}>
                <Input
                  label="Latest Deployed Production Version (Semver)"
                  value={editingConfig.currentLiveVersion}
                  onChangeText={(val) =>
                    setEditingConfig({ ...editingConfig, currentLiveVersion: val })
                  }
                  placeholder="e.g. 2.4.2"
                />

                <Input
                  label="Minimum Supported Version (Hard Gate)"
                  value={editingConfig.minSupportedVersion}
                  onChangeText={(val) =>
                    setEditingConfig({ ...editingConfig, minSupportedVersion: val })
                  }
                  placeholder="e.g. 2.1.0"
                />

                <Input
                  label="Google Play Store URL"
                  value={editingConfig.storeUrlAndroid}
                  onChangeText={(val) =>
                    setEditingConfig({ ...editingConfig, storeUrlAndroid: val })
                  }
                />

                {editingConfig.platforms.includes('iOS') && (
                  <Input
                    label="Apple App Store URL"
                    value={editingConfig.storeUrlIos}
                    onChangeText={(val) =>
                      setEditingConfig({ ...editingConfig, storeUrlIos: val })
                    }
                  />
                )}

                <Input
                  label="Release Notes & Mandatory Update Prompt Text"
                  value={editingConfig.releaseNotes}
                  onChangeText={(val) =>
                    setEditingConfig({ ...editingConfig, releaseNotes: val })
                  }
                  multiline={true}
                  numberOfLines={3}
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setEditingConfig(null)}
                />
                <Button
                  title="Save & Publish Policy ✓"
                  variant="primary"
                  onPress={() => handleSaveModal(editingConfig)}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  bundleText: {
    fontSize: 12,
    color: '#64748B',
  },
  forceUpdateCol: {
    alignItems: 'flex-end',
  },
  forceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  forceStatus: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
  },
  versionGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 12,
    marginBottom: 14,
  },
  versionBox: {
    flex: 1,
  },
  vBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  vBoxValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  vBoxSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notesContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  notesBody: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  bottomActions: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  updatedAt: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 540,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
