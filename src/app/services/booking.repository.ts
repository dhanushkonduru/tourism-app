import { InjectionToken } from '@angular/core';

import { BookingRecord } from '../models/booking.model';

export interface BookingRepository {
  save(booking: BookingRecord): void;
  getAll(): BookingRecord[];
  delete(bookingId: string): void;
}

export const BOOKING_REPOSITORY = new InjectionToken<BookingRepository>('BOOKING_REPOSITORY');
