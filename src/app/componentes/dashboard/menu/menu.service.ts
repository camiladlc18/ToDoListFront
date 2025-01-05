import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private proyectoSource = new BehaviorSubject<any>(null);
  currentProyecto = this.proyectoSource.asObservable();

  constructor() { }

  changeProyecto(proyecto: any) {
    this.proyectoSource.next(proyecto);
  }
}