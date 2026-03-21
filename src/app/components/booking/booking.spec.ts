import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocalStorageBookingRepository } from '../../services/local-storage-booking.repository';
import { BOOKING_REPOSITORY } from '../../services/booking.repository';
import { BookingComponent } from './booking';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingComponent],
      providers: [
        provideRouter([]),
        {
          provide: BOOKING_REPOSITORY,
          useClass: LocalStorageBookingRepository
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
