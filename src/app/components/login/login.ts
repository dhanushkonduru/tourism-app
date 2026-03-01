import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  onSubmit(): void {
    console.log('Login attempt:', { email: this.email, rememberMe: this.rememberMe });
    // TODO: Implement actual login logic
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
