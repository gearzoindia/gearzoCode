import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore, isLikelyJwt } from './auth-store';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

async function refreshTokens(instance: AxiosInstance, audience: string): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    await useAuthStore.getState().signOut();
    throw new Error('No refresh token available');
  }

  try {
    const res = await axios.post(
      `${instance.defaults.baseURL}/auth/refresh`,
      { refreshToken, audience },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const payload = (res.data as any)?.data || res.data;
    if (!payload?.accessToken) {
      throw new Error('Refresh response missing access token');
    }

    await useAuthStore.getState().setTokens({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken || refreshToken,
    });
  } catch (error) {
    await useAuthStore.getState().signOut();
    throw error;
  }
}

export function createApiClient({ baseURL, audience }: { baseURL: string; audience: string }): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach Authorization: Bearer <access>
  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: on 401 Unauthorized or TOKEN_EXPIRED -> single in-flight refresh -> retry
  let refreshPromise: Promise<void> | null = null;
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;
      const status = error.response?.status;
      const errorCode = error.response?.data?.error?.code;
      const isAuthRefresh = originalRequest?.url?.includes('/auth/refresh');

      if ((status === 401 || errorCode === 'TOKEN_EXPIRED') && !originalRequest?._retry && !isAuthRefresh) {
        originalRequest._retry = true;
        const currentRefreshToken = useAuthStore.getState().refreshToken;

        if (currentRefreshToken) {
          try {
            if (!refreshPromise) {
              refreshPromise = refreshTokens(instance, audience).finally(() => {
                refreshPromise = null;
              });
            }
            await refreshPromise;
            const newToken = useAuthStore.getState().accessToken;
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch (refreshErr) {
            await useAuthStore.getState().signOut();
            return Promise.reject(refreshErr);
          }
        } else {
          await useAuthStore.getState().signOut();
        }
      }

      if (errorCode === 'SESSION_REVOKED' || errorCode === 'SESSION_EXPIRED') {
        await useAuthStore.getState().signOut();
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
