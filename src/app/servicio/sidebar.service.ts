import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const BASIC_URL = 'http://localhost:8081/api';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getComentarios(idTarea: number): Observable<any> {
    return this.http.get(`${BASIC_URL}/tareas/${idTarea}/comentarios`, {
      headers: this.createAutorizationHeader()
    });
  }

   addComentario(idTarea: number, idUsuario: number, comentario: string) {
    return this.http.post(`${BASIC_URL}/tareas/comentarios/${idTarea}/${idUsuario}`, comentario, {
      headers: this.createAutorizationHeader()
    });
  }

  invitarUsuario(idProyecto: number, user: string): Observable<any> {
    return this.http.post(`${BASIC_URL}/invitados/invitar?idProyecto=${idProyecto}&user=${user}`, null, {
      headers: this.createAutorizationHeader()
    });
  }
  
  listarUsuarios(idProyecto: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASIC_URL}/invitados/${idProyecto}/usuarios`, {
      headers: this.createAutorizationHeader()
    });
  }

  postTarea(tarea: any) {
    return this.http.post(`${BASIC_URL}/tareas/agregar`, tarea, {
      headers: this.createAutorizationHeader()
    });
  }


  
  editTarea(tarea: any): Observable<any>  {
    return this.http.put(`${BASIC_URL}/tareas/actualizar/${tarea.idTarea}`, tarea, {
      headers: this.createAutorizationHeader()
    });
  }

  listarTareas(proyectoId: number): Observable<any> {
    return this.http.get(`${BASIC_URL}/tareas/usuario/${this.authService.getUserId()}/${proyectoId}`, {
      headers: this.createAutorizationHeader()
    });
  }


  // Método para eliminar tarea
  deleteTarea(idTarea: number) {
    return this.http.delete(`${BASIC_URL}/tareas/eliminar/${idTarea}`, {
      headers: this.createAutorizationHeader()
    });
  }

  
  aprobarTarea(idTarea: number) {
    return this.http.put(`${BASIC_URL}/tareas/aprobar/${idTarea}`, null, {
      headers: this.createAutorizationHeader()
    });
  }


  

  // Método para obtener los colores
  getColores(): Observable<any[]> {
    return this.http.get<any[]>(`${BASIC_URL}/colores`, {
      headers: this.createAutorizationHeader()
    });
  }

  // Método para obtener proyectos por usuario
  getProyectos(idUser: string ): Observable<any> {
    return this.http.get<any>(`${BASIC_URL}/proyectos/usuario/${idUser}`, {
      headers: this.createAutorizationHeader()
    });
  }

  // Método para obtener un proyecto
  getProyecto(idProyecto: number) {
    return this.http.get(`${BASIC_URL}/proyectos/${idProyecto}`, {
      headers: this.createAutorizationHeader()
    });
  }

  // Método para agregar proyecto
  postProyecto(proyecto: any) {
    return this.http.post(`${BASIC_URL}/proyectos/agregar`, proyecto, {
      headers: this.createAutorizationHeader()
    });
  }

  // Método para crear la cabecera de autorización
  createAutorizationHeader() {
    let authHeaders: HttpHeaders = new HttpHeaders();
    return authHeaders.set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );
  }

}
