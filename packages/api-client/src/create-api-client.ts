import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

async function refreshTokens(instance: AxiosInstance, audience: string): Promise<void> {
  const { useAuthStore } = await import('./auth-store');
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    await useAuthStore.getState().signOut();
    throw new Error('No refresh token available');
  }

  try {
    const res = await axios.post<{ accessToken: string; refreshToken?: string }>(
      `${instance.defaults.baseURL}/auth/refresh`,
      { refreshToken, audience },
      { headers: { 'Content-Type': 'application/json' } }
    );

    await useAuthStore.getState().setTokens({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken || refreshToken,
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
  instance.interceptors.request.use(async (config) => {
    const { useAuthStore } = await import('./auth-store');
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: on TOKEN_EXPIRED -> single in-flight refresh -> retry
  let refreshPromise: Promise<void> | null = null;
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;
      const errorCode = error.response?.data?.error?.code;

      if (errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        originalRequest._retry = true;
        if (!refreshPromise) {
          refreshPromise = refreshTokens(instance, audience).finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        const { useAuthStore } = await import('./auth-store');
        const newToken = useAuthStore.getState().accessToken;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return instance(originalRequest);
      }

      if (errorCode === 'SESSION_REVOKED' || errorCode === 'SESSION_EXPIRED') {
        const { useAuthStore } = await import('./auth-store');
        await useAuthStore.getState().signOut();
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
