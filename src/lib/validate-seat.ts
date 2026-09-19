const SEAT_ID_MAX_LENGTH = 10;
const ZONE_MAX_LENGTH = 20;
const SEAT_ID_PATTERN = /^[A-Za-z0-9-]+$/;

/** Trả về thông báo lỗi, hoặc undefined nếu hợp lệ. */
export function validateSeatId(raw: string): string | undefined {
  const id = raw.trim();
  if (id === '') {
    return 'Seat id is required.';
  }
  if (id.length > SEAT_ID_MAX_LENGTH) {
    return `Seat id must be ${SEAT_ID_MAX_LENGTH} characters or fewer.`;
  }
  if (!SEAT_ID_PATTERN.test(id)) {
    return 'Use only letters, numbers and hyphens.';
  }
  return undefined;
}

export function validateZone(raw: string): string | undefined {
  const zone = raw.trim();
  if (zone === '') {
    return 'Zone is required.';
  }
  if (zone.length > ZONE_MAX_LENGTH) {
    return `Zone must be ${ZONE_MAX_LENGTH} characters or fewer.`;
  }
  return undefined;
}