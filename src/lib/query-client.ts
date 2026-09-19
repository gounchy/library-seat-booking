import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Chỉ thử lại đúng 1 lần, và chỉ với lỗi mạng (lỗi tạm thời).
      retry: (failureCount, error) =>
        error instanceof ApiError && error.code === 'NETWORK' && failureCount < 1,
    },
  },
});