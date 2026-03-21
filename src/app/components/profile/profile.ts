import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthUser } from '../../models/auth-user.model';
import { BookingRecord } from '../../models/booking.model';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { FavoriteDestination, FavoritesService } from '../../services/favorites.service';
import { ToastService } from '../../services/toast.service';

type ProfileTab = 'overview' | 'bookings' | 'favorites' | 'settings';

interface UserProfileData {
  userId: string;
  location: string;
  avatarUrl: string;
  coverImageUrl: string;
  travelerLevel: string;
  destinationsVisited: number;
  updatedAt: string;
}

interface LocalStoredUserRecord {
  uid: string;
  displayName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface FavoriteDestinationViewModel {
  destinationId: string;
  name: string;
  country: string;
  imageUrl: string;
  rating: number;
  price: number;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=500&h=500&q=80';
const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&h=640&q=80';
const PROFILE_STORAGE_KEY = 'tourism_profile_data';
const USERS_STORAGE_KEY = 'localUsers';
const SESSION_STORAGE_KEY = 'auth_session';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: AuthUser | null = null;
  bookings: BookingRecord[] = [];

  selectedTab: ProfileTab = 'overview';

  location = 'Chennai, India';
  travelerLevel = 'Rising Voyager';
  destinationsVisited = 0;
  avatarUrl = DEFAULT_AVATAR;
  coverImageUrl = DEFAULT_COVER;

  readonly settingsForm;

  loading = true;
  deleting = false;
  savingProfile = false;

  readonly pageSize = 10;
  page = 1;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly bookingService: BookingService,
    private readonly favoritesService: FavoritesService,
    private readonly toastService: ToastService
  ) {
    this.settingsForm = this.formBuilder.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      location: ['', [Validators.maxLength(120)]],
      travelerLevel: ['', [Validators.maxLength(40)]],
      newPassword: ['', [Validators.minLength(8)]]
    });
  }

  async ngOnInit(): Promise<void> {
    const requestedTab = this.route.snapshot.queryParamMap.get('tab');
    if (requestedTab === 'bookings' || requestedTab === 'overview' || requestedTab === 'favorites' || requestedTab === 'settings') {
      this.selectedTab = requestedTab;
    }

    this.currentUser = this.authService.getCurrentUserSnapshot();
    this.applyProfileFromStorage();
    this.patchSettingsForm();
    await this.loadBookings();
  }

  get userDisplayName(): string {
    return this.currentUser?.displayName ?? 'Guest Traveler';
  }

  get userEmail(): string {
    return this.currentUser?.email ?? 'not-signed-in@example.com';
  }

  get memberSince(): string {
    if (!this.currentUser) {
      return 'Not available';
    }

    const localUsers = this.readLocalUsers();
    const localUser = localUsers.find((user) => user.uid === this.currentUser?.uid);
    const sourceDate = localUser?.createdAt ?? this.currentUser.uid;
    const parsed = new Date(sourceDate);

    if (Number.isNaN(parsed.getTime())) {
      return 'Member';
    }

    return parsed.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  get tripsCompleted(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.bookings.filter((booking) => booking.bookingDate < today).length;
  }

  get upcomingTrips(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.bookings.filter((booking) => booking.bookingDate >= today).length;
  }

  get totalMoneySpent(): number {
    return this.bookings.reduce((total, booking) => total + booking.totalCost, 0);
  }

  get favoriteDestinationName(): string {
    if (this.favoriteDestinations.length > 0) {
      return this.favoriteDestinations[0].name;
    }

    if (this.bookings.length === 0) {
      return 'Not enough data yet';
    }

    const frequency = new Map<string, number>();
    this.bookings.forEach((booking) => {
      frequency.set(booking.destinationName, (frequency.get(booking.destinationName) ?? 0) + 1);
    });

    let topName = this.bookings[0].destinationName;
    let topCount = 1;

    frequency.forEach((count, name) => {
      if (count > topCount) {
        topName = name;
        topCount = count;
      }
    });

    return topName;
  }

  get favoriteDestinations(): FavoriteDestinationViewModel[] {
    if (!this.currentUser) {
      return [];
    }

    return this.favoritesService.getFavorites(this.currentUser.uid).map((favorite) => this.toFavoriteViewModel(favorite));
  }

  get totalBookings(): number {
    return this.bookings.length;
  }

  get isSaveDisabled(): boolean {
    return this.settingsForm.invalid || this.savingProfile;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.bookings.length / this.pageSize));
  }

  get pagedBookings(): BookingRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.bookings.slice(start, start + this.pageSize);
  }

  setTab(tab: ProfileTab): void {
    this.selectedTab = tab;
  }

  isActiveTab(tab: ProfileTab): boolean {
    return this.selectedTab === tab;
  }

  removeFavorite(destinationId: string): void {
    if (!this.currentUser) {
      return;
    }

    this.favoritesService.removeFavorite(destinationId);
    this.toastService.info('Destination removed from favorites.');
  }

  async onAvatarSelected(event: Event): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Please upload a valid image file.');
      return;
    }

    const fileBase64 = await this.fileToBase64(file);
    this.avatarUrl = fileBase64;

    const profile = this.getOrCreateProfileData(this.currentUser.uid);
    profile.avatarUrl = fileBase64;
    this.saveProfileData(profile);

    this.toastService.success('Profile picture updated.');
  }

  async saveAccountSettings(): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.savingProfile = true;

    try {
      const formValue = this.settingsForm.getRawValue();

      const updatedUser: AuthUser = {
        uid: this.currentUser.uid,
        displayName: formValue.fullName.trim(),
        email: formValue.email.trim().toLowerCase()
      };

      this.currentUser = updatedUser;
      this.updateSessionUser(updatedUser);
      await this.updateLocalUserRecord(updatedUser, formValue.newPassword);

      const profile = this.getOrCreateProfileData(updatedUser.uid);
      profile.location = formValue.location.trim() || this.location;
      profile.travelerLevel = formValue.travelerLevel.trim() || this.travelerLevel;
      this.location = profile.location;
      this.travelerLevel = profile.travelerLevel;
      this.saveProfileData(profile);

      this.settingsForm.controls.newPassword.setValue('');
      this.settingsForm.markAsPristine();
      this.toastService.success('Account settings saved.');
    } catch {
      this.toastService.error('Unable to save profile settings.');
    } finally {
      this.savingProfile = false;
    }
  }

  async deleteBooking(bookingId: string): Promise<void> {
    this.deleting = true;

    try {
      await this.bookingService.deleteBookingEverywhere(bookingId);
      this.bookings = this.bookings.filter((booking) => booking.bookingId !== bookingId);
      this.toastService.success('Booking deleted successfully.');
      this.ensureValidPage();
    } catch {
      this.toastService.error('Unable to delete booking. Please try again.');
    } finally {
      this.deleting = false;
    }
  }

  async deleteAllBookings(): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    const confirmed = window.confirm('Delete all your bookings? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    this.deleting = true;

    try {
      await this.bookingService.deleteUserBookings(this.currentUser.uid);
      this.bookings = [];
      this.page = 1;
      this.toastService.success('All bookings deleted.');
    } catch {
      this.toastService.error('Unable to delete all bookings right now.');
    } finally {
      this.deleting = false;
    }
  }

  exportBookings(): void {
    if (!this.currentUser || this.bookings.length === 0) {
      this.toastService.info('No bookings to export yet.');
      return;
    }

    const localBookings = this.bookingService
      .getAllBookings()
      .filter((booking) => booking.userId === this.currentUser?.uid);

    const exportPayload = {
      user: this.currentUser,
      exportedAt: new Date().toISOString(),
      bookings: localBookings
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'bookings.json';
    anchor.click();
    URL.revokeObjectURL(url);

    this.toastService.success('Bookings exported as JSON.');
  }

  bookingReference(booking: BookingRecord): string {
    return booking.id || booking.bookingId;
  }

  nextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }

  prevPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  hasSettingsError(controlName: 'fullName' | 'email' | 'newPassword'): boolean {
    const control = this.settingsForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  settingsError(controlName: 'fullName' | 'email' | 'newPassword'): string {
    const control = this.settingsForm.controls[controlName];

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    if (controlName === 'email' && control.errors?.['email']) {
      return 'Enter a valid email address.';
    }

    if (controlName === 'fullName' && control.errors?.['minlength']) {
      return 'Full name must be at least 2 characters.';
    }

    if (controlName === 'newPassword' && control.errors?.['minlength']) {
      return 'Password must be at least 8 characters.';
    }

    return 'Invalid value.';
  }

  private async loadBookings(): Promise<void> {
    if (!this.currentUser) {
      this.bookings = [];
      this.loading = false;
      return;
    }

    this.loading = true;

    try {
      this.bookings = await this.bookingService.getBookingsByUser(this.currentUser.uid);
      this.destinationsVisited = new Set(this.bookings.map((booking) => booking.destinationId)).size;

      const profile = this.getOrCreateProfileData(this.currentUser.uid);
      profile.destinationsVisited = Math.max(profile.destinationsVisited, this.destinationsVisited);
      this.destinationsVisited = profile.destinationsVisited;
      this.saveProfileData(profile);
    } catch {
      this.bookings = [];
      this.toastService.error('Unable to load booking history.');
    } finally {
      this.loading = false;
      this.ensureValidPage();
    }
  }

  private ensureValidPage(): void {
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
  }

  private patchSettingsForm(): void {
    this.settingsForm.patchValue({
      fullName: this.userDisplayName,
      email: this.userEmail,
      location: this.location,
      travelerLevel: this.travelerLevel,
      newPassword: ''
    });
  }

  private applyProfileFromStorage(): void {
    if (!this.currentUser) {
      return;
    }

    const profile = this.getOrCreateProfileData(this.currentUser.uid);
    this.location = profile.location;
    this.avatarUrl = profile.avatarUrl;
    this.coverImageUrl = profile.coverImageUrl;
    this.travelerLevel = profile.travelerLevel;
    this.destinationsVisited = profile.destinationsVisited;
  }

  private getStoredProfileData(userId: string): UserProfileData | null {
    const allProfiles = this.readAllProfiles();
    return allProfiles[userId] ?? null;
  }

  private getOrCreateProfileData(userId: string): UserProfileData {
    const existingProfile = this.getStoredProfileData(userId);

    if (existingProfile) {
      return existingProfile;
    }

    return {
      userId,
      location: 'Chennai, India',
      avatarUrl: DEFAULT_AVATAR,
      coverImageUrl: DEFAULT_COVER,
      travelerLevel: 'Rising Voyager',
      destinationsVisited: 0,
      updatedAt: new Date().toISOString()
    };
  }

  private toFavoriteViewModel(favorite: FavoriteDestination): FavoriteDestinationViewModel {
    return {
      destinationId: favorite.id,
      name: favorite.name,
      country: favorite.country,
      imageUrl: favorite.image,
      rating: favorite.rating,
      price: favorite.price
    };
  }

  private saveProfileData(profile: UserProfileData): void {
    const allProfiles = this.readAllProfiles();
    allProfiles[profile.userId] = {
      ...profile,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(allProfiles));
  }

  private readAllProfiles(): Record<string, UserProfileData> {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, UserProfileData>) : {};
    } catch {
      return {};
    }
  }

  private readLocalUsers(): LocalStoredUserRecord[] {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as LocalStoredUserRecord[]) : [];
    } catch {
      return [];
    }
  }

  private updateSessionUser(user: AuthUser): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  }

  private async updateLocalUserRecord(user: AuthUser, nextPassword: string): Promise<void> {
    const localUsers = this.readLocalUsers();
    const index = localUsers.findIndex((storedUser) => storedUser.uid === user.uid);

    if (index < 0) {
      return;
    }

    const existing = localUsers[index];
    const trimmedPassword = nextPassword.trim();

    localUsers[index] = {
      ...existing,
      displayName: user.displayName,
      email: user.email,
      passwordHash: trimmedPassword ? await this.hashPassword(trimmedPassword) : existing.passwordHash
    };

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localUsers));
  }

  private async hashPassword(input: string): Promise<string> {
    const normalized = input.trim();

    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const data = new TextEncoder().encode(normalized);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    }

    return btoa(normalized);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Unable to read file.'));
      reader.readAsDataURL(file);
    });
  }
}
