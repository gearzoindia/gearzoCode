import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { UserProfile, AuthTokens } from '@gearzo/schemas';

const ACCESS_TOKEN_KEY = 'gearzo_access_token';
const REFRESH_TOKEN_KEY = 'gearzo_refresh_token';
const USER_KEY = 'gearzo_user_profile';

function getWebLocalStorage(): any {
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      const storage = getWebLocalStorage();
      if (storage) {
        storage.setItem(key, value);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.warn(`Failed to store ${key}:`, error);
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      const storage = getWebLocalStorage();
      if (storage) {
        return storage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn(`Failed to retrieve ${key}:`, error);
  }
  return null;
}

async function removeSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      const storage = getWebLocalStorage();
      if (storage) {
        storage.removeItem(key);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.warn(`Failed to remove ${key}:`, error);
  }
}

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export interface AuthState {
  status: AuthStatus;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  init: () => Promise<void>;
  signIn: (tokens: AuthTokens, user: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  setTokens: (tokens: Partial<AuthTokens>) => Promise<void>;
  setUser: (user: UserProfile) => void;
}

export function isLikelyJwt(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  refreshToken: null,

  init: async () => {
    try {
      const storedRefreshToken = await getSecureItem(REFRESH_TOKEN_KEY);
      const storedAccessToken = await getSecureItem(ACCESS_TOKEN_KEY);
      const storedUser = await getSecureItem(USER_KEY);
      const user = storedUser ? (JSON.parse(storedUser) as UserProfile) : null;

      const validAccessToken = isLikelyJwt(storedAccessToken) ? storedAccessToken : null;
      if (storedAccessToken && !validAccessToken) {
        await removeSecureItem(ACCESS_TOKEN_KEY);
      }

      if (storedRefreshToken) {
        set({
          accessToken: validAccessToken,
          refreshToken: storedRefreshToken,
          user,
          status: 'signedIn',
        });
      } else {
        set({
          status: 'signedOut',
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      }
    } catch {
      set({ status: 'signedOut', user: null, accessToken: null, refreshToken: null });
    }
  },

  signIn: async (tokens: AuthTokens, user: UserProfile) => {
    await setSecureItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await setSecureItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    await setSecureItem(USER_KEY, JSON.stringify(user));
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      status: 'signedIn',
    });
  },

  signOut: async () => {
    await removeSecureItem(REFRESH_TOKEN_KEY);
    await removeSecureItem(ACCESS_TOKEN_KEY);
    await removeSecureItem(USER_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'signedOut',
    });
  },

  setTokens: async (tokens: Partial<AuthTokens>) => {
    if (tokens.refreshToken) {
      await setSecureItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    if (tokens.accessToken) {
      await setSecureItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    }
    set((state) => ({
      accessToken: tokens.accessToken !== undefined ? tokens.accessToken : state.accessToken,
      refreshToken: tokens.refreshToken !== undefined ? tokens.refreshToken : state.refreshToken,
    }));
  },

  setUser: (user: UserProfile) => {
    set({ user });
    void setSecureItem(USER_KEY, JSON.stringify(user));
  },
}));
