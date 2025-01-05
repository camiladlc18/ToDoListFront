import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../servicio/auth.service';
import { SidebarService } from '../../../servicio/sidebar.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Color, Proyecto } from '../../../model/Models';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../menu/menu.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  username: string = '';
  errorMessage: string = '';
  proyectos: any[] = [];
  colores: Color[] = [];
  newProyecto: any = {
    nombre: '',
    color: { idColor: 0, nombre: '', codigoHex: '' },
    usuario: { id: 0, nombre: '', apellido: '', dni: '', user: ''}
  };
  isModalOpen: boolean = false;
  UserId = '';
  selectedColor: any = null;
  isDropdownOpen = false;
  firstLetter: string = '';
  randomColor: string = '';

  constructor(
    private authService: AuthService,
    private SidebarService: SidebarService, 
    private router: Router,
    private proyectoService: ProyectoService
  ) { }

  ngOnInit(): void {
    this.username = this.authService.getUserName() || 'Usuario';
    this.UserId = this.authService.getUserId();
    this.firstLetter = this.username.charAt(0).toUpperCase();
    this.randomColor = this.getRandomColor();
    this.loadColores();
    this.loadProyectos();
  }

  loadProyectos(): void {
    this.SidebarService.getProyectos(this.UserId).subscribe(
      (response) => {
        this.proyectos = response.proyectos;
        console.log(this.proyectos); 
      },
      (error) => {
        console.log(this.UserId)
        console.error('Error al obtener los proyectos:', error);
      }
    );
  }

  loadColores(): void {
    this.SidebarService.getColores().subscribe(
      (data) => {
        this.colores = data;
      },
      (error) => {
        console.error('Error al obtener los colores:', error);
      }
    );
  }

  addProyecto(): void {
    console.log(this.newProyecto);
    this.newProyecto.usuario.id = this.UserId;
    
    this.SidebarService.postProyecto(this.newProyecto as Proyecto).subscribe(
      proyecto => {
        this.loadProyectos();
        this.closeModal();
      },
      (error) => {
        if (error.status === 400) {
          this.errorMessage = error.error.mensaje;
        } else {
          console.error('Error al agregar la tarea:', error);
        }
      }
    );
  }

  onPopState = (event: PopStateEvent) => {
    history.pushState(null, '', location.href);
    alert('Debes cerrar sesión primero para volver a la página de inicio de sesión.');
  }

  logout() {
    window.removeEventListener('popstate', this.onPopState);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

    openModal() {
      this.isModalOpen = true;
    }
    
  
    closeModal() {
      this.isModalOpen = false;
      this.resetForm();
    }

    

    loadProyecto(idProyecto: number): void {
      this.SidebarService.getProyecto(idProyecto).subscribe(
        (response) => {
          console.log(idProyecto)
          this.proyectoService.changeProyecto(response);
        },
        (error) => {
          console.error('Error al cargar el proyecto:', error);
        }
      );
    }

    getRandomColor(): string {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  
    selectColor(color: any) {
      this.selectedColor = color;
      this.newProyecto.color.idColor = color.idColor;
      this.isDropdownOpen = false;
    }

    resetForm() {
      this.newProyecto = {
        nombre: '',
        color: {
          idColor: 0
        },
        usuario: { id: 0, nombre: '', apellido: '', dni: '', user: ''}
      };
      this.selectedColor = null;
      this.isDropdownOpen = false;
      this.errorMessage = ''; 
    }

}