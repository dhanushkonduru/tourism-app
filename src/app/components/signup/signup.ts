import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  readonly signupForm;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  formSubmitted = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.signupForm = this.formBuilder.nonNullable.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        agreeToTerms: [false, [Validators.requiredTrue]]
      },
      {
        validators: [this.matchPasswords]
      }
    );
  }

  get isSubmitDisabled(): boolean {
    return this.signupForm.invalid || this.isSubmitting;
  }

  hasFieldError(controlName: 'fullName' | 'email' | 'password' | 'confirmPassword' | 'agreeToTerms'): boolean {
    const control = this.signupForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.formSubmitted);
  }

  getFieldError(controlName: 'fullName' | 'email' | 'password' | 'confirmPassword' | 'agreeToTerms'): string {
    const control = this.signupForm.controls[controlName];

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    if (controlName === 'agreeToTerms' && control.errors?.['required']) {
      return 'Please accept terms and conditions.';
    }

    if (controlName === 'email' && control.errors?.['email']) {
      return 'Enter a valid email address.';
    }

    if ((controlName === 'password' || controlName === 'fullName') && control.errors?.['minlength']) {
      return controlName === 'password'
        ? 'Password must be at least 8 characters.'
        : 'Full name must be at least 2 characters.';
    }

    if (controlName === 'confirmPassword' && this.signupForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    return 'Invalid value.';
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const values = this.signupForm.getRawValue();
      await this.authService.signUpWithEmail({
        fullName: values.fullName,
        email: values.email,
        password: values.password
      });

      this.toastService.success('Account created successfully.');
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/profile';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      this.toastService.error(message);
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private matchPasswords(group: AbstractControl): Record<string, boolean> | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }
}
