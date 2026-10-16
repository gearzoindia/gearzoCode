import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';

export default function AcceptInviteScreen() {
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAccept = () => {
    if (!inviteToken || !password) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    Alert.alert('Invite Accepted', 'Your administrator account has been activated.');
    router.replace('/(auth)/setup-totp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Accept Admin Invitation</Text>
          <Text style={styles.sub}>
            Set your secure password and initialize administrative credentials.
          </Text>

          <View style={{ marginTop: 20 }}>
            <Input
              label="Invitation Token *"
              placeholder="Paste invite token received via email"
              value={inviteToken}
              onChangeText={setInviteToken}
            />

            <Input
              label="Create Secure Password *"
              placeholder="Minimum 12 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Input
              label="Confirm Password *"
              placeholder="Re-enter password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              title="Activate Account & Setup 2FA →"
              variant="primary"
              size="lg"
              onPress={handleAccept}
              style={{ marginTop: 12 }}
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
    backgroundColor: '#0F172A',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  sub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
});
