import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Task,
  TaskDetails,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
  TaskStatus
} from '../models/task.models';

// Re-export types for components
export type {
  Task,
  TaskDetails,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
  TaskStatus,
  TaskPriority
} from '../models/task.models';

export type { User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/api/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(filter?: TaskFilter): Observable<Task[]> {
    let params = new HttpParams();

    if (filter) {
      if (filter.status !== undefined) {
        params = params.set('status', filter.status.toString());
      }
      if (filter.teamId) {
        params = params.set('teamId', filter.teamId.toString());
      }
      if (filter.assignedToMe) {
        params = params.set('assignedToMe', 'true');
      }
    }

    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  getTask(id: number): Observable<TaskDetails> {
    return this.http.get<TaskDetails>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskRequest): Observable<{ id: number; title: string }> {
    return this.http.post<{ id: number; title: string }>(this.apiUrl, task);
  }

  updateTask(id: number, task: UpdateTaskRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task);
  }

  updateTaskStatus(id: number, status: TaskStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  assignTask(id: number, assignedToId: number | null): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/assign`, { assignedToId });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTeamMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/users/team-members`);
  }

  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/teams`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/users`);
  }
}