import { Component } from '@angular/core';
import { AuthService } from '../../../servicio/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthenticationRequest, AuthenticationResponse } from '../../../model/Models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports:[FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    if (!this.user || !this.password) {
      this.errorMessage = 'Por favor, ingresa tus credenciales.';
      this.isLoading = false;
      return;
    }
  
    const authRequest: AuthenticationRequest = {
      email: this.user,
      password: this.password
    };
  
    this.authService.login(authRequest).subscribe(
      (response: AuthenticationResponse) => {
        const user = {id: response.userId, name: response.name};
        this.authService.saveToken(response.jwt);
        this.authService.saveUser(user);
        this.successMessage = '¡Login exitoso! Redirigiendo...';
        
        setTimeout(() => {
          this.router.navigate(['/menu']);
        }, 1000);
      },
      (error: any) => {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        this.isLoading = false;
      }
    );
  }
  
}