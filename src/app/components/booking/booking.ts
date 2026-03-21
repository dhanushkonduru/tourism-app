import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, combineLatest, startWith } from 'rxjs';

import { BookingDraft } from '../../models/booking.model';
import { Destination } from '../../models/destination.model';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { DestinationService } from '../../services/destination.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss']
})
export class BookingComponent implements OnInit, OnDestroy {
  destination?: Destination;
  destinationNotFound = false;
  formSubmitted = false;

  selectedDays = 1;
  selectedTravelers = 1;
  costPulse = false;

  readonly bookingForm;

  private readonly subscriptions = new Subscription();
  private costPulseTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly destinationService: DestinationService,
    private readonly bookingService: BookingService,
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder
  ) {
    this.bookingForm = this.formBuilder.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      days: [1, [Validators.required, Validators.min(1), Validators.max(60)]],
      travelers: [1, [Validators.required, Validators.min(1), Validators.max(20)]]
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        const destinationId = params.get('id');

        if (!destinationId) {
          this.destination = undefined;
          this.destinationNotFound = true;
          return;
        }

        const foundDestination = this.destinationService.getDestinationById(destinationId);
        this.destination = foundDestination;
        this.destinationNotFound = !foundDestination;
      })
    );

    this.subscriptions.add(
      combineLatest([
        this.bookingForm.controls.days.valueChanges.pipe(startWith(this.bookingForm.controls.days.value)),
        this.bookingForm.controls.travelers.valueChanges.pipe(startWith(this.bookingForm.controls.travelers.value))
      ]).subscribe(([days, travelers]) => {
        this.selectedDays = this.normalizeInputValue(days);
        this.selectedTravelers = this.normalizeInputValue(travelers);
        this.triggerCostPulse();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.costPulseTimer) {
      clearTimeout(this.costPulseTimer);
    }
    this.subscriptions.unsubscribe();
  }

  get totalCost(): number {
    if (!this.destination) {
      return 0;
    }

    return this.computeTotalCost(this.selectedDays, this.selectedTravelers);
  }

  get isSubmitDisabled(): boolean {
    return !this.bookingForm.valid;
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  submitBooking(): void {
    this.formSubmitted = true;

    if (this.bookingForm.invalid || !this.destination) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const values = this.bookingForm.getRawValue();
    const currentUser = this.authService.getCurrentUserSnapshot();

    const booking = this.bookingService.saveBooking(this.buildBookingDraft({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      days: this.normalizeInputValue(values.days),
      travelers: this.normalizeInputValue(values.travelers)
    }), currentUser?.uid ?? null);

    void this.router.navigate(['/booking-confirmation', booking.id]);
  }

  hasFieldError(controlName: 'fullName' | 'email' | 'phone' | 'days' | 'travelers'): boolean {
    const control = this.bookingForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.formSubmitted);
  }

  getFieldError(controlName: 'fullName' | 'email' | 'phone' | 'days' | 'travelers'): string {
    const control = this.bookingForm.controls[controlName];

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    if (controlName === 'email' && control.errors?.['email']) {
      return 'Please enter a valid email address.';
    }

    if (controlName === 'phone' && control.errors?.['pattern']) {
      return 'Phone number must contain only digits (10-15 digits).';
    }

    if ((controlName === 'days' || controlName === 'travelers') && control.errors?.['min']) {
      return 'Value must be at least 1.';
    }

    if ((controlName === 'days' || controlName === 'travelers') && control.errors?.['max']) {
      return 'Value is above the allowed limit.';
    }

    if (controlName === 'fullName' && control.errors?.['minlength']) {
      return 'Please enter at least 2 characters.';
    }

    return 'Invalid value.';
  }

  private computeTotalCost(days: number, travelers: number): number {
    if (!this.destination) {
      return 0;
    }

    const validDays = Number.isFinite(days) ? Math.max(1, days) : 1;
    const validTravelers = Number.isFinite(travelers) ? Math.max(1, travelers) : 1;
    return this.destination.priceFrom * validDays * validTravelers;
  }

  private buildBookingDraft(values: {
    fullName: string;
    email: string;
    phone: string;
    days: number;
    travelers: number;
  }): BookingDraft {
    if (!this.destination) {
      throw new Error('Destination is not available for booking.');
    }

    return {
      destinationId: this.destination.destinationId,
      destinationName: this.destination.city,
      country: this.destination.country,
      destinationImage: this.destination.imageUrl,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      travelers: values.travelers,
      days: values.days,
      costPerDay: this.destination.priceFrom,
      totalCost: this.computeTotalCost(values.days, values.travelers),
      sourceForm: 'reactive'
    };
  }

  private normalizeInputValue(value: unknown): number {
    const normalized = Number(value);
    if (!Number.isFinite(normalized)) {
      return 1;
    }

    return Math.max(1, Math.floor(normalized));
  }

  private triggerCostPulse(): void {
    this.costPulse = false;

    if (this.costPulseTimer) {
      clearTimeout(this.costPulseTimer);
    }

    this.costPulseTimer = setTimeout(() => {
      this.costPulse = true;
      this.costPulseTimer = setTimeout(() => {
        this.costPulse = false;
      }, 230);
    }, 0);
  }
}
