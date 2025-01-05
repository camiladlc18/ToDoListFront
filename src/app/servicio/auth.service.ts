import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

const TOKEN = 'token';
const USER = 'user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8081/';

  constructor(private http: HttpClient, private router: Router) { }

  signup(signUpRequest: any): Observable<any> {
    return this.http.post(`${this.API_URL}api/auth/signup`, signUpRequest);
  }

  login(authRequest: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer <your_token>'
    });

    return this.http.post(`${this.API_URL}api/auth/login`, authRequest, { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    window.localStorage.removeItem(TOKEN);
    window.localStorage.removeItem(USER);
    this.router.navigate(['/login']);
  }

  sugerirUsername(nombre: string, apellido: string): Observable<string> {
    const params = new HttpParams()
      .set('nombre', nombre)
      .set('apellido', apellido);

    return this.http.get(`${this.API_URL}api/auth/sugerir-nombre-usuario`, {
      params,
      responseType: 'text'
    });
  }
  sugerirPassword(): Observable<string> {
    return this.http.get(`${this.API_URL}api/auth/sugerir-contraseña`, {
      responseType: 'text' 
    });
  }


  //Obterer Datos del Usuario
  saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN);
    window.localStorage.setItem(TOKEN, token);
  }

  saveUser(user: any): void {
    window.localStorage.removeItem(USER);
    window.localStorage.setItem(USER, JSON.stringify(user));
  }

  getToken(): string {
    return localStorage.getItem(TOKEN)!;
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem(USER)!);
  }

  getUserId(): string {
    const user = this.getUser();
    if (user) {
      return user.id;
    }

    return '';
  }
  getUserName(): string {
    const user = this.getUser();
    if (user) {
      return user.name;
    }

    return '';
  }


}