import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { replayOutbox } from '@/features/offline/replay';
import { selectIsOnline, useNetworkStore } from '@/lib/network';
import { useOutboxStore } from '@/store/outbox-store';

export function useOutboxSync(enabled: boolean): void {
  const queryClient = useQueryClient();
  const isOnline = useNetworkStore(selectIsOnline);
  const hydrated = useOutboxStore((s) => s.hydrated);

  useEffect(() => {
    if (enabled && isOnline && hydrated) {
      void replayOutbox(queryClient);
    }
  }, [enabled, isOnline, hydrated, queryClient]);
}