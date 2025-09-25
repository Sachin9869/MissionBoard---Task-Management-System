import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/auth.models';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Load user from localStorage on service initialization (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken && !this.isTokenExpired(storedToken)) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch {
          this.clearStoredAuth();
        }
      } else {
        this.clearStoredAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('tokenExpiry', response.expiresAt.toString());

          // Create a basic user object from the login response
          const basicUser = {
            id: 0, // Will be updated by getCurrentUser call
            username: response.username,
            email: '',
            role: { id: 0, name: response.role, description: '', level: 0 },
            permissions: response.permissions.map(p => ({ id: 0, name: p, description: '' })),
            organization: response.organizationId ? { id: response.organizationId, name: '' } : undefined,
            team: response.teamId ? { id: response.teamId, name: '' } : undefined
          };

          localStorage.setItem('user', JSON.stringify(basicUser));
          this.currentUserSubject.next(basicUser);
        }

        // Optionally get full user details in the background (don't block login)
        setTimeout(() => {
          this.getCurrentUserDetails().subscribe({
            next: () => {
              console.log('User details updated successfully');
            },
            error: (error) => {
              console.warn('Failed to get full user details, but login was successful:', error);
            }
          });
        }, 100);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUserDetails(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    this.clearStoredAuth();
    this.currentUserSubject.next(null);
  }

  private clearStoredAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token && !this.isTokenExpired(token)) {
        return token;
      }
      this.clearStoredAuth();
    }
    return null;
  }

  private isTokenExpired(token: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;

    return new Date() >= new Date(expiry);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role.name === role : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions.some(p => p.name === permission) : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role.name) : false;
  }

  isOwnerOrAdmin(): boolean {
    return this.hasAnyRole(['Owner', 'Admin']);
  }

  canManageTasks(): boolean {
    return this.hasAnyRole(['Owner', 'Admin', 'Manager']) || this.hasPermission('tasks.create');
  }
}