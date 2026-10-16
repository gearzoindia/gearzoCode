import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@gearzo/api-client';
import { LoadingScreen } from '@gearzo/ui';

export default function MechanicAppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen message="Loading GearZo Partner..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="job-request/[offerId]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="job/[id]/index" />
      <Stack.Screen name="job/[id]/navigate" />
      <Stack.Screen name="job/[id]/start" />
      <Stack.Screen name="job/[id]/work" />
      <Stack.Screen name="job/[id]/complete" />
      <Stack.Screen name="availability" />
    </Stack>
  );
}
