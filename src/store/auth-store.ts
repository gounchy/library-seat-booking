import { create } from 'zustand';

import { getCurrentUser, signIn as requestSignIn, type Session } from '@/api/auth-api';
import { ApiError } from '@/api/client';
import { queryClient, queryPersister } from '@/lib/query-client';
import { clearSession, readSession, saveSession } from '@/lib/secure-storage';
import { useFilterStore } from '@/store/filter-store';
import { useOutboxStore } from '@/store/outbox-store';
import type { User } from '@/types';

type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  restoreSession: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'restoring',
  user: null,

  restoreSession: async () => {
    let stored: Session | null = null;
    try {
      stored = await readSession();
    } catch {
      stored = null;
    }

    if (stored === null) {
      set({ status: 'signedOut', user: null });
      return;
    }

    try {
      const user = await getCurrentUser(stored.token);
      set({ status: 'signedIn', user });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
        await clearSession();
        set({ status: 'signedOut', user: null });
      } else {
        // Không liên lạc được server (offline): tin session đã lưu để vẫn dùng được app.
        set({ status: 'signedIn', user: stored.user });
      }
    }
  },

  signIn: async (username, password) => {
    const session = await requestSignIn(username, password);
    await saveSession(session);
    set({ status: 'signedIn', user: session.user });
  },

   signOut: async () => {
    try {
      await clearSession();
    } finally {
      queryClient.clear();
      useFilterStore.getState().resetFilters();
      useOutboxStore.getState().clear();
      set({ status: 'signedOut', user: null });
      await queryPersister.removeClient();
    }
  },
}));