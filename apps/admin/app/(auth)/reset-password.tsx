import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = () => {
    if (!code || !newPassword) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    Alert.alert('Password Updated', 'Your administrator password has been updated. Please log in.');
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.sub}>
            Enter the verification code sent to {params.email || 'your email'} along with your new password.
          </Text>

          <View style={{ marginTop: 20 }}>
            <Input
              label="Reset Code *"
              placeholder="e.g. 6-digit verification code"
              value={code}
              onChangeText={setCode}
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
              placeholder="Re-enter password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              title="Reset Password & Login →"
              variant="primary"
              size="lg"
              onPress={handleReset}
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
