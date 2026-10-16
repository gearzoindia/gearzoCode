import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@gearzo/api-client';
import { LoadingScreen } from '@gearzo/ui';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen message="Loading GearZo..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ animation: 'fade' }} />
      <Stack.Screen name="vehicles/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="vehicles/[id]" />
      <Stack.Screen name="services/index" />
      <Stack.Screen name="services/[id]" />
      <Stack.Screen name="booking/checkout" />
      <Stack.Screen name="booking/payment" />
      <Stack.Screen name="booking/payment-failed" />
      <Stack.Screen name="booking/confirmed" options={{ gestureEnabled: false }} />
      <Stack.Screen name="booking/[id]/searching" options={{ gestureEnabled: false }} />
      <Stack.Screen name="booking/[id]/track" />
      <Stack.Screen name="booking/[id]/progress" />
      <Stack.Screen name="booking/[id]/invoice" />
      <Stack.Screen name="subscription/[id]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/upcoming" />
      <Stack.Screen name="profile/order-history" />
      <Stack.Screen name="profile/rewards" />
      <Stack.Screen name="profile/settings" />
      <Stack.Screen name="profile/legal" />
      <Stack.Screen name="profile/help" />
      <Stack.Screen name="addresses/index" />
      <Stack.Screen name="addresses/edit" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
