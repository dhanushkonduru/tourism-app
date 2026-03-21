import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface ContactMessageRecord {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const CONTACT_MESSAGES_STORAGE_KEY = 'contact-messages';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class ContactComponent {
  readonly contactForm;
  submitted = false;
  successMessage = '';

  constructor(private readonly formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  submitMessage(): void {
    this.submitted = true;
    this.successMessage = '';

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const payload = this.contactForm.getRawValue();
    this.storeMessage({
      ...payload,
      createdAt: new Date().toISOString()
    });

    this.successMessage = 'Message sent successfully.';
    this.contactForm.reset({
      fullName: '',
      email: '',
      subject: '',
      message: ''
    });
    this.submitted = false;
  }

  hasFieldError(controlName: 'fullName' | 'email' | 'subject' | 'message'): boolean {
    const control = this.contactForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.submitted);
  }

  fieldError(controlName: 'fullName' | 'email' | 'subject' | 'message'): string {
    const control = this.contactForm.controls[controlName];

    if (control.errors?.['required']) {
      return 'This field is required.';
    }

    if (controlName === 'email' && control.errors?.['email']) {
      return 'Enter a valid email address.';
    }

    if (control.errors?.['minlength']) {
      return 'Please enter more details.';
    }

    return 'Invalid value.';
  }

  private storeMessage(message: ContactMessageRecord): void {
    const stored = this.readStoredMessages();
    stored.unshift(message);
    localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(stored.slice(0, 50)));
  }

  private readStoredMessages(): ContactMessageRecord[] {
    const raw = localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as ContactMessageRecord[]) : [];
    } catch {
      return [];
    }
  }
}
