import * as SecureStore from 'expo-secure-store';

import type { Session } from '@/api/auth-api';

const SESSION_KEY = 'library-session';

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { token, user } = value as { token?: unknown; user?: unknown };
  if (typeof token !== 'string' || typeof user !== 'object' || user === null) {
    return false;
  }
  return typeof (user as { studentName?: unknown }).studentName === 'string';
}

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function readSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}