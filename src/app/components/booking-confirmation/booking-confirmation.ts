import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { BookingRecord } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-confirmation.html',
  styleUrls: ['./booking-confirmation.scss']
})
export class BookingConfirmationComponent implements OnInit {
  booking: BookingRecord | null = null;
  private readonly storageKey = 'bookings';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');

    if (!bookingId) {
      this.booking = null;
      return;
    }

    const storedBookings = this.readBookingsFromLocalStorage();
    const normalizedBookings = storedBookings.map((record) => this.normalizeBooking(record));
    const fromStorage = normalizedBookings.find((record) => record.id === bookingId || record.bookingId === bookingId) ?? null;

    this.booking = fromStorage
      ?? this.bookingService
        .getAllBookings()
        .find((record) => record.id === bookingId || record.bookingId === bookingId)
      ?? null;
  }

  private readBookingsFromLocalStorage(): BookingRecord[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
    } catch {
      return [];
    }
  }

  private normalizeBooking(record: BookingRecord): BookingRecord {
    const normalizedId = record.id || record.bookingId;
    const normalizedFullName = record.fullName || record.userName || 'Traveler';

    return {
      ...record,
      id: normalizedId,
      bookingId: normalizedId,
      fullName: normalizedFullName,
      userName: normalizedFullName,
      pricePerDay: record.pricePerDay ?? record.costPerDay,
      costPerDay: record.costPerDay ?? record.pricePerDay
    };
  }
}
