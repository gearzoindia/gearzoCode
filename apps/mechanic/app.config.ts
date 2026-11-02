import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GearZo Mechanic',
  slug: 'gearzo-mechanic',
  scheme: 'gearzo-mechanic',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1B5E20',
  },
  ios: {
    bundleIdentifier: 'in.gearzo.mechanic',
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'GearZo Mechanic uses your location to dispatch nearby customer jobs and navigate to customer doorsteps.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'GearZo Mechanic uses your location while online to match you with nearby service bookings.',
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyBuAtqTFqh8QMc0hIbAI7MozwGanxKdhQA',
    },
  },
  android: {
    package: 'in.gearzo.mechanic',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1B5E20',
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyBuAtqTFqh8QMc0hIbAI7MozwGanxKdhQA',
      },
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow GearZo Mechanic to use your location to receive nearby job offers and navigate to customers.',
        locationWhenInUsePermission:
          'Allow GearZo Mechanic to access your location while using the app for job dispatch and navigation.',
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    'expo-notifications',
    'expo-camera',
  ],
  experiments: {
    typedRoutes: true,
  },
});
