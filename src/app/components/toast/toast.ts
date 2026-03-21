import { AsyncPipe, CommonModule, NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { ToastService } from '../../services/toast.service';
import { ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgFor, AsyncPipe, NgClass],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent {
  readonly messages$: Observable<ToastMessage[]>;

  constructor(private readonly toastService: ToastService) {
    this.messages$ = this.toastService.messages$;
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
