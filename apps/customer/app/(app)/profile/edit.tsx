import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useCustomerRegister } from '@gearzo/api-client';
import { Button, Input } from '@gearzo/ui';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || 'Bengaluru');

  const registerMutation = useCustomerRegister();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
      });
      if (user) {
        setUser({
          ...user,
          name: name.trim(),
          email: email.trim() || undefined,
          city: city.trim() || undefined,
        });
      }
      Alert.alert('Saved', 'Your profile details have been updated.');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Rahul Sharma"
        />

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="rahul@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="City / Region"
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Bengaluru"
        />

        <Input
          label="Phone Number"
          value={user?.phone || '+91'}
          editable={false}
          inputStyle={{ color: '#6B7280' }}
        />

        <Button
          title="Save Changes"
          variant="primary"
          size="lg"
          loading={registerMutation.isPending}
          onPress={handleSave}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
