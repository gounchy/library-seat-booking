import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Cache lưu bền vững được dùng lại tối đa bấy nhiêu lâu. */
export const PERSIST_MAX_AGE = ONE_DAY_MS;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Phải lớn hơn hoặc bằng maxAge của persister, nếu không cache bị dọn sớm.
      gcTime: ONE_DAY_MS,
      // Luôn gọi hàm lấy dữ liệu; mock API tự báo lỗi NETWORK khi offline.
      networkMode: 'always',
      // Chỉ thử lại đúng 1 lần, và chỉ với lỗi mạng (lỗi tạm thời).
      retry: (failureCount, error) =>
        error instanceof ApiError && error.code === 'NETWORK' && failureCount < 1,
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'library-query-cache',
});