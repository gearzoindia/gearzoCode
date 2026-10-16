import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="type" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="skills" />
      <Stack.Screen name="location" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="bank" />
      <Stack.Screen name="under-review" options={{ gestureEnabled: false }} />
      <Stack.Screen name="rejected" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
