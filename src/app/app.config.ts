import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { BOOKING_REPOSITORY } from './services/booking.repository';
import { LocalStorageBookingRepository } from './services/local-storage-booking.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: BOOKING_REPOSITORY,
      useExisting: LocalStorageBookingRepository
    },
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    )
  ]
};
