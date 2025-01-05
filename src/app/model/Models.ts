export interface UserDto {
  idUsuario: number;
  nombre: string;
  apellido: string;
  dni: string;
  user: string;
  email: string;
  password: string;
}


export interface SignUpRequest {
  nombre: string;
  apellido: string;
  dni: string;
  user: string;
  email: string;
  password: string;
}

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  jwt: string;
  userId: number;
  name: string;
}

export interface Color {
  idColor: number;
  nombre: string;
  codigoHex: string;
  colorDto: {
    idColor: number;
    nombre: string;
    codigoHex: string;
  };
}

export interface Proyecto {
  idProyecto: number;
  nombre: string;
  color: Color;
  usuario: UserDto;
  secciones: any;
  tareas: any;
}


export interface Comentario {
  autor: string;
  contenido: string;
  fechaCreacion: string;
}

export interface Tarea {
  idTarea?: number;
  nombre: string;
  descripcion: string;
  fechaVencimiento: string;
  prioridad: string;
  estado: string;
  asignadoA: string | null;
  usuario: {
    id: number;
  };
  proyecto: {
    id_proyecto: number;
  };
  comentarios?: Comentario[];
}


