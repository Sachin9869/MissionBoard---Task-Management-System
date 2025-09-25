import { Routes } from '@angular/router';
import { SimpleLoginComponent } from './components/simple-login/simple-login.component';
import { SimpleDashboardComponent } from './components/simple-dashboard/simple-dashboard.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: SimpleLoginComponent },
  {
    path: 'dashboard',
    component: SimpleDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: SimpleDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Owner', 'Admin'] }
  },
  {
    path: 'manager',
    component: SimpleDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Owner', 'Admin', 'Manager'] }
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/dashboard' }
];
