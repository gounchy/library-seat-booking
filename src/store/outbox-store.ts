import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isPending } from '@/lib/outbox';
import type { OutboxAction, OutboxItem } from '@/types';

type OutboxState = {
  items: OutboxItem[];
  /** Đã nạp xong dữ liệu từ AsyncStorage chưa. Không được lưu. */
  hydrated: boolean;
  setHydrated: () => void;
  enqueue: (action: OutboxAction) => OutboxItem;
  markFailed: (id: string, error: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      enqueue: (action) => {
        const now = Date.now();
        const item: OutboxItem = {
          id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: now,
          action,
        };
        set({ items: [...get().items, item] });
        return item;
      },
      markFailed: (id, error) =>
        set({ items: get().items.map((item) => (item.id === id ? { ...item, error } : item)) }),
      remove: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'library-outbox',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export const selectPendingCount = (state: OutboxState): number =>
  state.items.filter(isPending).length;

export const selectFailedCount = (state: OutboxState): number =>
  state.items.filter((item) => !isPending(item)).length;