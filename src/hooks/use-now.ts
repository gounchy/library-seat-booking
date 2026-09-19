import { useEffect, useState } from 'react';

/** Trả về thời điểm hiện tại, tự cập nhật theo chu kỳ. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}