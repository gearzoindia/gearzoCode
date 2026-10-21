import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@gearzo/ui';
import { useAdminLogin } from '@gearzo/api-client';

export default function AdminLoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useAdminLogin();

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      if (response.challengeId) {
        router.push({
          pathname: '/(auth)/otp',
          params: {
            challengeId: response.challengeId,
            maskedPhone: response.maskedPhone || '',
          },
        });
      } else if (response.requiresTotp && response.tempToken) {
        router.push({
          pathname: '/(auth)/totp',
          params: { tempToken: response.tempToken },
        });
      } else {
        router.replace('/(app)/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error?.response?.data?.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cardWrapper}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={{ fontSize: 28 }}>🛡️</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>GearZo Admin</Text>
              <Text style={styles.brandSub}>Operations & Governance Console</Text>
            </View>
          </View>

          <Card variant="elevated" style={styles.loginCard}>
            <Text style={styles.formTitle}>Sign in to Admin Portal</Text>
            <Text style={styles.formSub}>
              Protected system. Authorized personnel and operations staff only.
            </Text>

            <Input
              label="Work Email Address *"
              placeholder="admin@gearzo.in"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errorMsg) setErrorMsg(null);
              }}
            />

            <Input
              label="Password *"
              placeholder="••••••••••••"
              secureTextEntry
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errorMsg) setErrorMsg(null);
              }}
            />

            <View style={styles.forgotRow}>
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <Button
              title="Authenticate & Continue →"
              variant="primary"
              size="lg"
              loading={loginMutation.isPending}
              onPress={handleLogin}
              style={{ marginTop: 8 }}
            />
          </Card>

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => router.push('/(auth)/accept-invite')}>
              <Text style={styles.inviteLink}>Have an onboarding invite code? Accept invite</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  cardWrapper: {
    width: '100%',
    maxWidth: 440,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  brandSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  loginCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  formSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 14,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  inviteLink: {
    color: '#94A3B8',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
