import { Injectable } from '@angular/core';

import { BookingRecord } from '../models/booking.model';
import { BookingRepository } from './booking.repository';

const STORAGE_KEY = 'bookings';
const LEGACY_STORAGE_KEY = 'tourism-bookings';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageBookingRepository implements BookingRepository {
  save(booking: BookingRecord): void {
    const existingBookings = this.getAll();
    existingBookings.push(booking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingBookings));
  }

  getAll(): BookingRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(raw);
      const bookings = Array.isArray(parsedValue)
        ? (parsedValue as BookingRecord[]).map((booking) => this.normalizeBooking(booking))
        : [];

      // Keep data under the new canonical key for future repository swaps.
      if (localStorage.getItem(STORAGE_KEY) === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
      }

      return bookings;
    } catch {
      return [];
    }
  }

  delete(bookingId: string): void {
    const nextBookings = this.getAll().filter((booking) => booking.bookingId !== bookingId && booking.id !== bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookings));
  }

  private normalizeBooking(booking: BookingRecord): BookingRecord {
    const normalizedId = booking.id || booking.bookingId;
    const normalizedFullName = booking.fullName || booking.userName || 'Traveler';

    return {
      ...booking,
      id: normalizedId,
      bookingId: normalizedId,
      fullName: normalizedFullName,
      userName: normalizedFullName,
      pricePerDay: booking.pricePerDay ?? booking.costPerDay,
      costPerDay: booking.costPerDay ?? booking.pricePerDay
    };
  }
}
