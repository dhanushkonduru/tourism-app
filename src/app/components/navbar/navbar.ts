import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthUser } from '../../models/auth-user.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  isScrolled = false;
  readonly currentUser$: Observable<AuthUser | null>;

  constructor(
    private readonly authService: AuthService,
    private readonly toastService: ToastService
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.toastService.info('You have been signed out.');
  }
}
