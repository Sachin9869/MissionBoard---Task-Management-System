import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, UserInfo } from '../../../../../../libs/shared/ts/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/me`);
  }

  logout(): Observable<void> {
    // Since we're using stateless JWT, just return success
    // In a production app, you might want to call a logout endpoint
    // to invalidate the token on the server side
    return of(undefined);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const userJson = localStorage.getItem('user');
    if (!userJson) return false;

    try {
      const user: UserInfo = JSON.parse(userJson);
      return user.roles.includes(role);
    } catch {
      return false;
    }
  }

  hasRight(right: string): boolean {
    const userJson = localStorage.getItem('user');
    if (!userJson) return false;

    try {
      const user: UserInfo = JSON.parse(userJson);
      return user.rights.includes(right);
    } catch {
      return false;
    }
  }
}