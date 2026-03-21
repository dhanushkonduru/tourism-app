import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  show(type: ToastType, text: string, durationMs = 3000): void {
    const message: ToastMessage = {
      id: this.buildId(),
      type,
      text
    };

    this.messagesSubject.next([...this.messagesSubject.value, message]);

    setTimeout(() => {
      this.dismiss(message.id);
    }, durationMs);
  }

  dismiss(id: string): void {
    this.messagesSubject.next(this.messagesSubject.value.filter((item) => item.id !== id));
  }

  success(text: string): void {
    this.show('success', text);
  }

  error(text: string): void {
    this.show('error', text, 4500);
  }

  info(text: string): void {
    this.show('info', text);
  }

  private buildId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
