import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home';
import { DestinationsComponent } from './components/destinations/destinations';
import { BookingComponent } from './components/booking/booking';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation';
import { ContactComponent } from './components/contact/contact';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ProfileComponent } from './components/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'destinations', component: DestinationsComponent },
  { path: 'booking', redirectTo: 'destinations', pathMatch: 'full' },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'booking-confirmation/:id', component: BookingConfirmationComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }
];
