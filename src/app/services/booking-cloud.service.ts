import { Injectable } from '@angular/core';

import { BookingRecord } from '../models/booking.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingCloudService {
  constructor(private readonly authService: AuthService) {}

  async saveBooking(booking: BookingRecord): Promise<void> {
    if (this.authService.getMode() !== 'firebase' || !booking.userId) {
      return;
    }

    const db = await this.authService.getFirebaseFirestore();
    if (!db) {
      return;
    }

    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    await setDoc(doc(db, 'bookings', booking.bookingId), {
      ...booking,
      serverCreatedAt: serverTimestamp()
    });
  }

  async getUserBookings(userId: string): Promise<BookingRecord[]> {
    if (this.authService.getMode() !== 'firebase') {
      return [];
    }

    const db = await this.authService.getFirebaseFirestore();
    if (!db) {
      return [];
    }

    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const snapshot = await getDocs(query(collection(db, 'bookings'), where('userId', '==', userId)));

    return snapshot.docs
      .map((docRef) => docRef.data() as BookingRecord)
      .filter((record) => Boolean(record?.bookingId));
  }

  async deleteBooking(bookingId: string): Promise<void> {
    if (this.authService.getMode() !== 'firebase') {
      return;
    }

    const db = await this.authService.getFirebaseFirestore();
    if (!db) {
      return;
    }

    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'bookings', bookingId));
  }
}
