import { ApiError } from '@/api/client';

/** Đổi lỗi kỹ thuật thành câu người dùng đọc được. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK':
        return 'Cannot reach the server. Check your connection and try again.';
      case 'NOT_FOUND':
        return 'We could not find what you were looking for.';
      case 'UNAUTHORIZED':
        return 'Your session is not valid. Please sign in again.';
      case 'VALIDATION':
      case 'CONFLICT':
        return error.message;
    }
  }
  return 'Something unexpected happened. Please try again.';
}