import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@gearzo/api-client';
import { LoadingScreen } from '@gearzo/ui';

export default function AdminRootIndex() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(app)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return <LoadingScreen message="Loading GearZo Admin..." />;
}

