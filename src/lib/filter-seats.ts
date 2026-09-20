import type { Seat } from '@/types';

/** Lọc theo zone và tìm theo id (không phân biệt hoa/thường, khớp một phần). */
export function filterSeats(
  seats: Seat[],
  searchText: string,
  zone: string | null,
  outletOnly = false,
): Seat[] {
  const query = searchText.trim().toLowerCase();
  return seats.filter((seat) => {
    const matchesZone = zone === null || seat.zone === zone;
    const matchesId = query === '' || seat.id.toLowerCase().includes(query);
    const matchesOutlet = !outletOnly || seat.hasOutlet;
    return matchesZone && matchesId && matchesOutlet;
  });
}

/** Danh sách zone không trùng, sắp xếp theo thứ tự chữ cái. */
export function getZones(seats: Seat[]): string[] {
  return [...new Set(seats.map((seat) => seat.zone))].sort();
}