export interface BookingRecord {
  id: string;
  bookingId: string;
  destinationId: string;
  destinationName: string;
  country: string;
  destinationImage: string;
  userId: string | null;
  fullName: string;
  userName?: string;
  email: string;
  phone: string;
  travelers: number;
  days: number;
  pricePerDay: number;
  costPerDay: number;
  totalCost: number;
  sourceForm: 'reactive';
  bookingDate: string;
  createdAt: string;
}

export interface BookingDraft {
  destinationId: string;
  destinationName: string;
  country: string;
  destinationImage: string;
  fullName: string;
  email: string;
  phone: string;
  travelers: number;
  days: number;
  costPerDay: number;
  totalCost: number;
  sourceForm: 'reactive';
}
