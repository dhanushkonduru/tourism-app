import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home';
import { DestinationsComponent } from './components/destinations/destinations';
import { BookingComponent } from './components/booking/booking';
import { ContactComponent } from './components/contact/contact';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'destinations', component: DestinationsComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'contact', component: ContactComponent }
];
