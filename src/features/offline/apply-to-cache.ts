import type { QueryClient } from '@tanstack/react-query';

import { bookingKeys } from '@/features/bookings/use-bookings';
import { seatKeys } from '@/features/seats/use-seats';
import type { Booking, OutboxItem, Seat } from '@/types';

export function applyToCache(queryClient: QueryClient, item: OutboxItem): void {
  const { action } = item;

  switch (action.type) {
    case 'createSeat': {
      const seat = action.seat;
      queryClient.setQueryData<Seat[]>(seatKeys.all, (old) => (old ? [...old, seat] : old));
      queryClient.setQueryData<Seat>(seatKeys.detail(seat.id), seat);
      return;
    }
    case 'updateSeat': {
      const { seatId, input } = action;
      queryClient.setQueryData<Seat[]>(seatKeys.all, (old) =>
        old?.map((seat) => (seat.id === seatId ? { ...seat, ...input } : seat)),
      );
      queryClient.setQueryData<Seat>(seatKeys.detail(seatId), (old) =>
        old ? { ...old, ...input } : old,
      );
      return;
    }
    case 'createBooking': {
      const booking: Booking = {
        id: `pending-${item.id}`,
        ...action.booking,
        timeSlot: { ...action.booking.timeSlot },
      };
      queryClient.setQueryData<Booking[]>(bookingKeys.all, (old) =>
        old ? [...old, booking] : old,
      );
      return;
    }
  }
}