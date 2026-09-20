import { createBooking } from '@/api/bookings-api';
import { createSeat, updateSeat } from '@/api/seats-api';
import type { OutboxAction } from '@/types';

export async function executeAction(action: OutboxAction): Promise<void> {
  switch (action.type) {
    case 'createSeat':
      await createSeat(action.seat);
      return;
    case 'updateSeat':
      await updateSeat(action.seatId, action.input);
      return;
    case 'createBooking':
      await createBooking(action.booking);
      return;
  }
}