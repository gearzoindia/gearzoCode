import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@gearzo/ui';

const ROLES = ['OPS_MANAGER', 'SUPPORT_EXECUTIVE', 'FINANCE_AUDITOR', 'SUPER_ADMIN'];

export default function InviteAdminScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OPS_MANAGER');

  const handleSendInvite = () => {
    if (!name || !email) {
      Alert.alert('Required', 'Please enter staff name and work email.');
      return;
    }
    Alert.alert('Invite Dispatched', `Onboarding token has been sent to ${email}.`);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Administrative Staff</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.formTitle}>Issue Single-Use Invitation</Text>
          <Text style={styles.formSub}>
            Recipient will receive a secure token to set their password and configure mandatory 2FA.
          </Text>

          <Input
            label="Staff Full Name *"
            placeholder="e.g. Anand R."
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Corporate Email Address *"
            placeholder="anand@gearzo.in"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Select Role & Permissions *</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const isSelected = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, isSelected && styles.roleChipActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleText, isSelected && styles.roleTextActive]}>
                    {r.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Dispatch Invitation Email"
            variant="primary"
            size="lg"
            onPress={handleSendInvite}
            style={{ marginTop: 24 }}
          />
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
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
});
