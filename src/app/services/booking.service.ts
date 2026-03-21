import { Inject, Injectable } from '@angular/core';

import { BookingDraft, BookingRecord } from '../models/booking.model';
import { BookingCloudService } from './booking-cloud.service';
import { BOOKING_REPOSITORY, BookingRepository } from './booking.repository';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository,
    private readonly bookingCloudService: BookingCloudService
  ) {}

  saveBooking(draft: BookingDraft, userId: string | null = null): BookingRecord {
    const now = new Date();
    const bookingId = this.generateBookingId(now);

    const booking: BookingRecord = {
      id: bookingId,
      bookingId,
      ...draft,
      userId,
      pricePerDay: draft.costPerDay,
      bookingDate: now.toISOString().slice(0, 10),
      createdAt: now.toISOString()
    };

    this.bookingRepository.save(booking);
    void this.bookingCloudService.saveBooking(booking);
    return booking;
  }

  createBooking(draft: BookingDraft, userId: string | null = null): BookingRecord {
    return this.saveBooking(draft, userId);
  }

  generateBookingId(referenceDate: Date = new Date()): string {
    const year = referenceDate.getFullYear();
    const sequence = this.getNextSequenceForYear(year);
    return `BK-${year}-${String(sequence).padStart(4, '0')}`;
  }

  getAllBookings(): BookingRecord[] {
    return this.bookingRepository.getAll();
  }

  async getUserBookings(userId: string): Promise<BookingRecord[]> {
    const localBookings = this.bookingRepository.getAll().filter((booking) => booking.userId === userId);
    const remoteBookings = await this.bookingCloudService.getUserBookings(userId);

    const mergedById = new Map<string, BookingRecord>();
    [...localBookings, ...remoteBookings].forEach((booking) => {
      mergedById.set(booking.bookingId, booking);
    });

    return Array.from(mergedById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getBookingsByUser(userId: string): Promise<BookingRecord[]> {
    return this.getUserBookings(userId);
  }

  deleteBooking(bookingId: string): void {
    this.bookingRepository.delete(bookingId);
    void this.bookingCloudService.deleteBooking(bookingId);
  }

  async deleteBookingEverywhere(bookingId: string): Promise<void> {
    this.bookingRepository.delete(bookingId);
    await this.bookingCloudService.deleteBooking(bookingId);
  }

  async deleteUserBookings(userId: string): Promise<void> {
    const userBookings = await this.getUserBookings(userId);
    await Promise.all(userBookings.map((booking) => this.deleteBookingEverywhere(booking.bookingId)));
  }

  private getNextSequenceForYear(year: number): number {
    const bookings = this.bookingRepository.getAll();

    const maxSequence = bookings.reduce((max, booking) => {
      const candidateId = booking.id || booking.bookingId;
      const sequence = this.extractSequence(candidateId, year);
      return sequence > max ? sequence : max;
    }, 0);

    return maxSequence + 1;
  }

  private extractSequence(bookingId: string | undefined, year: number): number {
    if (!bookingId) {
      return 0;
    }

    const pattern = new RegExp(`^BK-${year}-(\\d{4})$`);
    const match = bookingId.match(pattern);
    if (!match) {
      return 0;
    }

    return Number.parseInt(match[1], 10) || 0;
  }
}
