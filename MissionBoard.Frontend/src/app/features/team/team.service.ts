import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from './team.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = '/api/Team';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  add(team: Team): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team);
  }

  update(team: Team): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${team.id}`, team);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
