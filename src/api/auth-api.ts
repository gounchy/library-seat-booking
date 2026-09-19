import { ApiError, simulateRequest } from '@/api/client';
import type { User } from '@/types';

type Account = {
  username: string;
  password: string;
  studentName: string;
};

/** Tài khoản mock. Mật khẩu thô chỉ chấp nhận được vì đây là mock. */
const ACCOUNTS: Account[] = [
  { username: '1923050808', password: 'library123', studentName: 'Nguyen Vu Ngoc Huy' },
  { username: '1923050001', password: 'library123', studentName: 'Tran Van B' },
];

const TOKEN_PREFIX = 'mock-token:';

export type Session = {
  token: string;
  user: User;
};

const toUser = (account: Account): User => ({ studentName: account.studentName });

export function signIn(username: string, password: string): Promise<Session> {
  return simulateRequest(() => {
    const name = username.trim();
    if (!name || !password) {
      throw new ApiError('VALIDATION', 'Username and password are required.');
    }
    const account = ACCOUNTS.find((a) => a.username === name && a.password === password);
    if (!account) {
      throw new ApiError('UNAUTHORIZED', 'Wrong username or password.');
    }
    return { token: `${TOKEN_PREFIX}${account.username}`, user: toUser(account) };
  });
}

/** Xác minh token và trả về người dùng tương ứng. Dùng khi khôi phục session. */
export function getCurrentUser(token: string): Promise<User> {
  return simulateRequest(() => {
    if (!token.startsWith(TOKEN_PREFIX)) {
      throw new ApiError('UNAUTHORIZED', 'Invalid token.');
    }
    const username = token.slice(TOKEN_PREFIX.length);
    const account = ACCOUNTS.find((a) => a.username === username);
    if (!account) {
      throw new ApiError('UNAUTHORIZED', 'Invalid token.');
    }
    return toUser(account);
  });
}