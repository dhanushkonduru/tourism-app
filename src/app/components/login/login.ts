import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  readonly loginForm;
  showPassword = false;
  isSubmitting = false;
  formSubmitted = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  get isSubmitDisabled(): boolean {
    return this.loginForm.invalid || this.isSubmitting;
  }

  hasFieldError(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.formSubmitted);
  }

  getFieldError(controlName: 'email' | 'password'): string {
    const control = this.loginForm.controls[controlName];

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    if (controlName === 'email' && control.errors?.['email']) {
      return 'Enter a valid email address.';
    }

    if (controlName === 'password' && control.errors?.['minlength']) {
      return 'Password must be at least 8 characters.';
    }

    return 'Invalid value.';
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const values = this.loginForm.getRawValue();
      await this.authService.loginWithEmail({
        email: values.email,
        password: values.password
      });

      this.toastService.success('Login successful. Welcome back.');

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/profile';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      this.toastService.error(message);
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
