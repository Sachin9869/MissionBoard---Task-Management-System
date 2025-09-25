import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rights } from './rights.model';

@Injectable({ providedIn: 'root' })
export class RightsService {
  private apiUrl = '/api/Rights';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rights[]> {
    return this.http.get<Rights[]>(this.apiUrl);
  }

  getById(id: number): Observable<Rights> {
    return this.http.get<Rights>(`${this.apiUrl}/${id}`);
  }

  add(rights: Rights): Observable<Rights> {
    return this.http.post<Rights>(this.apiUrl, rights);
  }

  update(rights: Rights): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${rights.id}`, rights);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
