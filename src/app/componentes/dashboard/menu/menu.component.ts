import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../servicio/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { ProyectoService } from './menu.service';
import { Subscription } from 'rxjs';
import { Comentario, Proyecto, Tarea} from '../../../model/Models';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../servicio/sidebar.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true, 
  imports: [
    CommonModule, 
    SidebarComponent,
    FormsModule,
  ] 
})
export class MenuComponent implements OnInit, OnDestroy {
  username: string = '';
  errorMessage: string = '';
  UserId = 0;
  proyecto: Proyecto | undefined;
  tareas: any[] = [];
  usuarios: any[] = []; 
  isModalOpen: boolean = false;
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalInviteOpen: boolean = false; 
  proyectoSubscription: Subscription | undefined;
  
  selectedTarea: any = {
    nombre: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: '',
    comentario: ''
  };

  isModalCommentOpen: boolean = false;

  newTarea: any = {
    nombre: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: 'MEDIA',
    estado: 'PENDIENTE',
    usuario: { id: 0 },
    proyecto: { id_proyecto: 0 }
  };

  comentarios: Comentario[] = [];  
  comentarioTexto: string = ''; 

  constructor(
    private cd: ChangeDetectorRef,
    private AuthService: AuthService,
    private SidebarService: SidebarService, 
    private router: Router,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit() {
    this.UserId = Number(this.AuthService.getUserId());
    this.preventBrowserNavigation();
    this.proyectoSubscription = this.proyectoService.currentProyecto.subscribe(response => {
      if (response) {
        this.proyecto = response.proyecto;
        this.tareas = response.proyecto.tareas.map((tarea: Tarea) => ({
          ...tarea,
          asignadoA: tarea.asignadoA || 'Sin asignar'
        }));
        console.log(this.tareas)
        this.listarUsuarios(); 
        
   
        this.tareas.forEach(tarea => {
          this.SidebarService.getComentarios(tarea.idTarea).subscribe({
            next: (response: any) => {
              if (response && response.comentarios) {
                tarea.comentarios = response.comentarios;
                this.cd.detectChanges();
              }
            },
            error: (error) => {
              console.error('Error al cargar comentarios:', error);
            }
          });
        });
      }
    });
  }

  preventBrowserNavigation() {
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', this.onPopState);
  }

  onPopState = (event: PopStateEvent) => {
    history.pushState(null, '', location.href);
    alert('Debes cerrar sesión primero para volver a la página de inicio de sesión.');
  }

  ngOnDestroy() {
    window.removeEventListener('popstate', this.onPopState);
    if (this.proyectoSubscription) {
      this.proyectoSubscription.unsubscribe();
    }
  }

  invitarUsuario(user: string) {
    if (this.proyecto) {
      const idProyecto = this.proyecto.idProyecto;
      this.SidebarService.invitarUsuario(idProyecto, user).subscribe({
        next: (response) => {
          alert(`Usuario ${user} invitado con éxito.`);
          this.listarUsuarios(); 
        },
        error: (error) => {
          console.error('Error al invitar usuario:', error);
          this.errorMessage = 'No se pudo invitar al usuario';
        }
      });
    }
  }


  listarUsuarios() {
    if (this.proyecto) {
      this.SidebarService.listarUsuarios(this.proyecto.idProyecto).subscribe({
        next: (data) => {
          this.usuarios = data;
        },
        error: (error) => {
          console.error('Error al listar usuarios:', error);
          this.errorMessage = 'No se pudieron obtener los usuarios';
        }
      });
    }
  }

  openModalInvite() {
    this.isModalInviteOpen = true;
  }

  closeModalInvite() {
    this.isModalInviteOpen = false;
    this.errorMessage = '';
  }

  eliminarTarea(idTarea: number) {
    const confirmar = confirm('¿Estás seguro de eliminar esta tarea?');
    
    if (confirmar) {
      this.SidebarService.deleteTarea(idTarea).subscribe(
        (response) => {
          this.tareas = this.tareas.filter(tarea => tarea.idTarea !== idTarea);
          this.cd.detectChanges(); 
        },
        (error) => {
          console.error('Error al eliminar la tarea:', error);
          this.errorMessage = 'No se pudo eliminar la tarea';
        }
      );
    }
  }

  resetNewTarea() {
    this.newTarea = {
      nombre: '',
      descripcion: '',
      fechaVencimiento: '',
      prioridad: 'MEDIA',
      estado: 'PENDIENTE',
      usuario: { id: 0 },
      proyecto: { id_proyecto: 0 },
      asignadoA: null
    };
  }

  aprobarTarea(idTarea: number): void {
    this.SidebarService.aprobarTarea(idTarea).subscribe(
      (response: any) => {
        console.log('Tarea aprobada con éxito:', response);
  
        if (response.mensaje) {
          alert(response.mensaje);
        }
  
        const tareaIndex = this.tareas.findIndex((t) => t.idTarea === idTarea);
        if (tareaIndex !== -1) {
          this.tareas[tareaIndex] = {
            ...this.tareas[tareaIndex],
            estado: 'DESARROLLADA' 
          };
          this.cd.detectChanges(); 
        }
      },
      (error) => {
        console.error('Error al aprobar la tarea:', error);
  
        if (error.error && error.error.mensaje) {
          alert(error.error.mensaje);
        } else {
          alert('Ocurrió un error al aprobar la tarea.');
        }
      }
    );
  }

  openModalEdit(tarea: any) {
    this.selectedTarea = {...tarea};
    this.isModalEditOpen = true;
  }

  editarTarea() {
    if (this.selectedTarea) {
      this.SidebarService.editTarea(this.selectedTarea).subscribe(
        (response) => {
          const index = this.tareas.findIndex(t => t.idTarea === this.selectedTarea.idTarea);
          if (index !== -1) {
            this.tareas[index] = this.selectedTarea;
          }
          this.closeModalEdit();
          this.cd.detectChanges(); 
        },
        (error) => {
          console.error('Error al editar la tarea:', error);
          this.errorMessage = 'No se pudo editar la tarea';
        }
      );
    }
  }

  closeModalEdit() {
    this.isModalEditOpen = false;
    this.selectedTarea = null;
    this.errorMessage = '';
  }

  addTarea() {
    if (!this.newTarea.fechaVencimiento) {
      this.errorMessage = 'La fecha de vencimiento es obligatoria.';
      return;
    }
    
    if (this.proyecto) {
      const tareaToSend = {
        ...this.newTarea,
        proyecto: { id_proyecto: this.proyecto.idProyecto },
        usuario: { id: this.UserId },

        asignadoA: this.newTarea.asignadoA || 'Sin asignar'
      };
      this.SidebarService.postTarea(tareaToSend).subscribe({
        next: (response: any) => {
          if (response && response.tarea) {
            const newTarea = {
              ...response.tarea,
              asignadoA: tareaToSend.asignadoA 
            };
            this.tareas.push(newTarea);
            this.cd.detectChanges();
          }
          this.closeModalAdd();
          this.resetNewTarea();
        },
        error: (error) => {
          if (error.status === 400) {
            this.errorMessage = error.error.mensaje;
          } else {
            console.error('Error al agregar la tarea:', error);
            alert('Ocurrió un error al agregar la tarea.');
          }
        }
      });
    }
  }
  
  onSelectUsuario(usuario: any) {
    this.newTarea.asignadoA = usuario.nombre; 
  }
  

  openModalAdd() {
    this.isModalAddOpen = true;
    this.resetNewTarea();
  }

  closeModalAdd() {
    this.isModalAddOpen = false;
    this.resetNewTarea(); 
  }
  
  openModalComment(tarea: any) {
    this.selectedTarea = { ...tarea };
    this.comentarios = this.selectedTarea.comentarios; 
    this.isModalCommentOpen = true;
    this.comentarioTexto = '';  
    
    this.SidebarService.getComentarios(tarea.idTarea).subscribe({
      next: (response: any) => {
        console.log('Comentarios obtenidos:', response);
        if (response && response.comentarios) {
          this.comentarios = response.comentarios.map((comment: any) => ({
            autor: comment.autor,        
            contenido: comment.contenido, 
            fechaCreacion: comment.fechaCreacion 
          }));
        } else {
          this.comentarios = [];
        }
      },
      error: (error) => {
        console.error('Error al obtener los comentarios:', error);
        this.errorMessage = 'No se pudieron cargar los comentarios';
      }
    });
  }

  closeModalComment() {
    this.isModalCommentOpen = false;   
    this.selectedTarea = null;         
    this.errorMessage = '';          
  }

  abrirComment() {
    if (this.selectedTarea && this.comentarioTexto.trim()) {
      const comentario = this.comentarioTexto.trim();
  
      this.SidebarService.addComentario(this.selectedTarea.idTarea, this.UserId, comentario).subscribe({
        next: (response: any) => {
          const tareaIndex = this.tareas.findIndex(t => t.idTarea === this.selectedTarea.idTarea);
          if (tareaIndex !== -1) {
            if (!this.tareas[tareaIndex].comentarios) {
              this.tareas[tareaIndex].comentarios = [];
            }
            this.tareas[tareaIndex].comentarios.push({
              autor: this.AuthService.getUserName(),
              contenido: comentario,
              fechaCreacion: new Date().toISOString()
            });
          }
  
          if (Array.isArray(this.comentarios)) {
            this.comentarios.push({
              autor: this.AuthService.getUserName(),
              contenido: comentario,
              fechaCreacion: new Date().toISOString()
            });
          }
          
          this.comentarioTexto = '';
          this.cd.detectChanges(); 
          alert('Comentario agregado exitosamente');
        },
        error: (error) => {
          console.error('Error al añadir comentario:', error);
          this.errorMessage = 'No se pudo añadir el comentario';
        }
      });
    } else {
      this.errorMessage = 'Por favor, escribe un comentario';
    }
  }
  
}
