import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@gearzo/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B5E20' }}>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Top spacer */}
        <View />

        {/* Center brand logo and tagline */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 48 }}>⚙️</Text>
          </View>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            GearZo
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '500',
              color: '#A5D6A7',
              letterSpacing: 0.5,
            }}
          >
            Mechanic in Minutes
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#E8F5E9',
              textAlign: 'center',
              marginTop: 12,
              maxWidth: 280,
              lineHeight: 20,
            }}
          >
            On-demand doorstep vehicle servicing, maintenance, and emergency roadside repairs
          </Text>
        </View>

        {/* Bottom actions & links */}
        <View style={{ width: '100%' }}>
          <Button
            title="Continue with Mobile Number"
            variant="secondary"
            size="lg"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginBottom: 16,
            }}
            textStyle={{ color: '#1B5E20', fontWeight: '700' }}
            onPress={() => router.push('/(auth)/phone')}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 12, color: '#C8E6C9' }}>By continuing, you agree to our </Text>
            <TouchableOpacity onPress={() => router.push('/(app)/profile/legal')}>
              <Text style={{ fontSize: 12, color: '#FFFFFF', textDecorationLine: 'underline', fontWeight: '600' }}>
                Terms
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: '#C8E6C9' }}> & </Text>
            <TouchableOpacity onPress={() => router.push('/(app)/profile/legal')}>
              <Text style={{ fontSize: 12, color: '#FFFFFF', textDecorationLine: 'underline', fontWeight: '600' }}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
