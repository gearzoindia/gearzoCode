import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@gearzo/ui';
import { useCustomerRegister } from '@gearzo/api-client';
import { registerCustomerSchema } from '@gearzo/schemas';

const MAJOR_CITIES = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Pune', 'Chennai'];

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(MAJOR_CITIES[0]);
  const [errors, setErrors] = useState<{ name?: string; email?: string; general?: string }>({});

  const registerMutation = useCustomerRegister();

  const handleSkip = () => {
    router.replace('/(app)/(tabs)');
  };

  const handleContinue = async () => {
    setErrors({});
    const validation = registerCustomerSchema.safeParse({
      name: name.trim(),
      email: email.trim() || undefined,
      city: city || undefined,
    });

    if (!validation.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      for (const err of validation.error.errors) {
        if (err.path[0] === 'name') fieldErrors.name = err.message;
        if (err.path[0] === 'email') fieldErrors.email = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        city,
      });
      router.replace('/(app)/(tabs)');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({ general: error?.response?.data?.message || 'Failed to save profile. You can continue as guest.' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Header with Skip button */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 }}>
              <TouchableOpacity onPress={handleSkip} accessibilityRole="button" accessibilityLabel="Skip profile setup">
                <Text style={{ fontSize: 15, color: '#1B5E20', fontWeight: '600' }}>Skip for now</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
              Tell us your name
            </Text>
            <Text style={{ fontSize: 15, color: '#6B7280', marginBottom: 28, lineHeight: 22 }}>
              Personalize your GearZo experience to easily manage bookings and invoices.
            </Text>

            <Input
              label="Your Full Name *"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
              accessibilityLabel="Full name input"
            />

            <Input
              label="Email Address (Optional)"
              placeholder="rahul@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              accessibilityLabel="Email address input"
            />

            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              City
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {MAJOR_CITIES.map((c) => {
                const isSelected = city === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCity(c)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isSelected ? '#1B5E20' : '#F3F4F6',
                      borderWidth: 1,
                      borderColor: isSelected ? '#1B5E20' : '#E5E7EB',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: isSelected ? '#FFFFFF' : '#4B5563',
                      }}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errors.general && (
              <Text style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{errors.general}</Text>
            )}
          </View>

          <View style={{ paddingTop: 20 }}>
            <Button
              title="Get Started"
              variant="primary"
              size="lg"
              loading={registerMutation.isPending}
              disabled={!name.trim() || registerMutation.isPending}
              onPress={handleContinue}
              accessibilityLabel="Save profile and get started"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
