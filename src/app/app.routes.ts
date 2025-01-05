import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/authentication/login/login.component';
import { RegisterComponent } from './componentes/authentication/register/register.component';
import { MenuComponent } from './componentes/dashboard/menu/menu.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'menu', component: MenuComponent, canActivate: [AuthGuard]},
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent }
];