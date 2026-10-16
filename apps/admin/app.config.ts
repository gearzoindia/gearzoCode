import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GearZo Admin',
  slug: 'gearzo-admin',
  scheme: 'gearzo-admin',
  version: '1.0.0',
  orientation: 'default',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0D3811',
  },
  ios: {
    bundleIdentifier: 'in.gearzo.admin',
    supportsTablet: true,
  },
  android: {
    package: 'in.gearzo.admin',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0D3811',
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-location', 'expo-notifications'],
  experiments: {
    typedRoutes: true,
  },
});
