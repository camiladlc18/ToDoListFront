import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../servicio/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule
    
  ],
  providers: [AuthService]
})
export class RegisterComponent {
  signupForm: FormGroup;
  mensajeUsuario: string = '';
  mostrarMensaje: boolean = false;
  mostrarErrorUsername: boolean = false;
  mensajeErrorUsername: string = '';
  submitted = false;
  mostrarPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]{3,20}')]],
      apellido: ['', [Validators.required, Validators.pattern('[a-zA-Z ]{3,20}')]],
      dni: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      user: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]{6,30}')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  hasError(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return (control?.invalid && (control?.touched || this.submitted)) ?? false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `El ${controlName} es requerido`;
      }
      if (control.errors['pattern']) {
        switch (controlName) {
          case 'nombre':
          case 'apellido':
            return 'Solo se permiten letras (3-20 caracteres)';
          case 'dni':
            return 'El DNI debe tener 8 dígitos';
          case 'user':
            return 'El usuario debe tener entre 6 y 30 caracteres alfanuméricos';
          default:
            return 'Formato inválido';
        }
      }
      if (control.errors['email']) {
        return 'Ingrese un email válido';
      }
      if (control.errors['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    return '';
  }

  sugerirUsername() {
    const nombre = this.signupForm.get('nombre')?.value;
    const apellido = this.signupForm.get('apellido')?.value;

    if (!nombre || !apellido || this.signupForm.get('nombre')?.invalid || this.signupForm.get('apellido')?.invalid) {
      this.mensajeErrorUsername = 'Por favor, llene los campos nombre y apellido correctamente';
      this.mostrarErrorUsername = true;
      return;
    }

    this.mostrarErrorUsername = false;
    this.authService.sugerirUsername(nombre, apellido).subscribe({
      next: (sugerirUsername) => {
        this.signupForm.patchValue({ user: sugerirUsername });
        this.mensajeUsuario = 'Usuario generado exitosamente';
        this.mostrarMensaje = true;
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 3000);
      },
      error: (error) => {
        this.mensajeUsuario = 'Error al generar el usuario';
        this.mostrarMensaje = true;
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 3000);
      }
    });
  }

  sugerirPassword() {
    this.authService.sugerirPassword().subscribe(password => {
      this.signupForm.patchValue({ password });
    });
  }

  togglePasswordVisibility() {
    this.mostrarPassword = !this.mostrarPassword;
  }
  onSubmit() {
    this.submitted = true;

    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  
    if (this.signupForm.invalid) {
      return;
    }

    this.authService.signup(this.signupForm.value).subscribe({
      next: (response) => {
        console.log('Usuario registrado exitosamente', response);
        this.mensajeUsuario = '¡Registro exitoso! Redirigiendo al login...';
        this.mostrarMensaje = true;
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al registrar usuario', error);
        
        if (error.error) {
          this.mensajeUsuario = error.error;  
        } else {
          this.mensajeUsuario = 'Error al registrar usuario. Inténtalo de nuevo.';
        }

        this.mostrarMensaje = true;
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 60000);
      }
    });
  }
  
}
