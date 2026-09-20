export type ApiErrorCode =
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'UNAUTHORIZED';

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

type Simulation = {
  /** Độ trễ mỗi request, tính bằng mili giây. */
  latencyMs: number;
  /** Nếu true, request kế tiếp bị lỗi mạng (rồi tự về false). */
  failNext: boolean;
  /** Nếu true, mọi request đều bị lỗi mạng. */
  failAll: boolean;
  /** Thiết bị đang offline: mọi request thất bại ngay với lỗi mạng. */
  offline: boolean;
};

const simulation: Simulation = { latencyMs: 600, failNext: false, failAll: false, offline: false };

export function setSimulation(patch: Partial<Simulation>): void {
  Object.assign(simulation, patch);
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Giả lập một request: chờ, có thể lỗi mạng, rồi mới chạy logic "server".
 * Nếu handler throw ApiError, Promise trả về sẽ bị reject với lỗi đó.
 */
export async function simulateRequest<T>(handler: () => T): Promise<T> {
  if (simulation.offline) {
    throw new ApiError('NETWORK', 'You are offline.');
  }
  await wait(simulation.latencyMs);
  if (simulation.failAll || simulation.failNext) {
    simulation.failNext = false;
    throw new ApiError('NETWORK', 'Cannot reach the server (simulated).');
  }
  return handler();
}