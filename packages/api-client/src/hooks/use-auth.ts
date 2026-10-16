import { useAuthStore } from '../auth-store';

export function useAuth() {
  const {
    user,
    status,
    accessToken,
    refreshToken,
    signIn,
    signOut,
    setTokens,
    setUser,
    init,
  } = useAuthStore();

  return {
    user,
    status,
    accessToken,
    refreshToken,
    isAuthenticated: status === 'signedIn',
    isLoading: status === 'loading',
    signIn,
    signOut,
    setTokens,
    setUser,
    init,
  };
}
