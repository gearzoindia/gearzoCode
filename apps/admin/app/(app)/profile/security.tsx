import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input, Badge } from '@gearzo/ui';

export default function AdminSecurityScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Required', 'Please fill in password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    Alert.alert('Password Changed', 'Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Security & Credentials</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 2FA Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.sectionTitle}>Two-Factor Authentication (TOTP)</Text>
              <Text style={styles.sectionSub}>Enforced across all administrative personnel</Text>
            </View>
            <Badge label="ENABLED" variant="success" />
          </View>
          <Button
            title="Re-enroll Authenticator App 📲"
            variant="outline"
            size="sm"
            onPress={() => router.push('/(auth)/setup-totp')}
            style={{ marginTop: 14, alignSelf: 'flex-start' }}
          />
        </Card>

        {/* Change Password Card */}
        <Card variant="default" style={styles.card}>
          <Text style={styles.sectionTitle}>Update Administrator Password</Text>
          <Text style={styles.sectionSub}>Must be at least 12 characters with alphanumeric & symbols</Text>

          <View style={{ marginTop: 16 }}>
            <Input
              label="Current Password *"
              placeholder="••••••••••••"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Input
              label="New Password *"
              placeholder="Minimum 12 characters"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Input
              label="Confirm New Password *"
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              title="Update Password"
              variant="primary"
              size="lg"
              onPress={handleChangePassword}
              style={{ marginTop: 10 }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  card: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});
