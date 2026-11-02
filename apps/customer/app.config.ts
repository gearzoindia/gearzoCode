import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GearZo',
  slug: 'gearzo-customer',
  scheme: 'gearzo-customer',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1B5E20',
  },
  ios: {
    bundleIdentifier: 'in.gearzo.customer',
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'GearZo uses your location to detect your doorstep address and find nearby verified mechanics.',
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyBuAtqTFqh8QMc0hIbAI7MozwGanxKdhQA',
    },
  },
  android: {
    package: 'in.gearzo.customer',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1B5E20',
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
    ],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyBuAtqTFqh8QMc0hIbAI7MozwGanxKdhQA',
      },
    },
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
          'Allow GearZo to access your location to detect your doorstep address and track nearby mechanics.',
        locationWhenInUsePermission:
          'Allow GearZo to access your location while using the app to detect your doorstep address.',
      },
    ],
    'expo-notifications',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '',
    },
  },
});
