import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from './authReducer';

export const AUTH_TOKEN_KEY = 'staygrid.auth.token';
export const AUTH_USER_KEY = 'staygrid.auth.user';

export type StoredAuthSession = {
  token: string | null;
  user: AuthUser | null;
};

export async function loadAuthSession(): Promise<StoredAuthSession> {
  const entries = await AsyncStorage.multiGet([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  const token = entries[0]?.[1] || null;
  const userValue = entries[1]?.[1] || null;

  return {
    token,
    user: userValue ? (JSON.parse(userValue) as AuthUser) : null,
  };
}

export async function saveAuthSession(token: string | null, user: AuthUser | null): Promise<void> {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, token ?? ''],
    [AUTH_USER_KEY, user ? JSON.stringify(user) : ''],
  ]);
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
}