import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.models';

@Component({
  selector: 'app-simple-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <!-- Header -->
      <header class="shadow transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-800' : 'bg-white'">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold transition-colors duration-300" [ngClass]="isDarkMode ? 'text-white' : 'text-gray-900'">MissionBoard Dashboard</h1>
            <div class="flex items-center space-x-4">
              <span *ngIf="currentUser" class="text-sm" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Welcome, {{ currentUser.username }} - {{ currentUser.role.name }}
              </span>
              <button
                (click)="toggleDarkMode()"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                [ngClass]="isDarkMode ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' : 'bg-gray-700 hover:bg-gray-800 text-white'"
                title="Toggle Dark Mode"
              >
                {{ isDarkMode ? '☀️' : '🌙' }}
              </button>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Stats Cards -->
            <div class="overflow-hidden shadow rounded-lg transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-800' : 'bg-white'">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="text-lg font-medium" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Total Tasks</div>
                  </div>
                  <div class="ml-auto text-2xl font-bold" [ngClass]="isDarkMode ? 'text-white' : 'text-gray-900'">{{ tasks.length }}</div>
                </div>
              </div>
            </div>

            <div class="overflow-hidden shadow rounded-lg transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-800' : 'bg-white'">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="text-lg font-medium" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">In Progress</div>
                  </div>
                  <div class="ml-auto text-2xl font-bold text-blue-600">{{ getTasksByStatus(1).length }}</div>
                </div>
              </div>
            </div>

            <div class="overflow-hidden shadow rounded-lg transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-800' : 'bg-white'">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="text-lg font-medium" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Completed</div>
                  </div>
                  <div class="ml-auto text-2xl font-bold text-green-600">{{ getTasksByStatus(3).length }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="shadow overflow-hidden sm:rounded-md transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-800' : 'bg-white'">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium" [ngClass]="isDarkMode ? 'text-white' : 'text-gray-900'">Recent Tasks</h3>
              <p class="mt-1 max-w-2xl text-sm" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Your assigned and team tasks</p>
            </div>
            <button
              *ngIf="canCreateTasks()"
              (click)="openCreateTaskModal()"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Create Task
            </button>
          </div>

          <div *ngIf="loading" class="p-4 text-center">
            <div class="transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Loading tasks...</div>
          </div>

          <div *ngIf="error" class="p-4 transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-50 text-red-700'">
            {{ error }}
          </div>

          <ul *ngIf="!loading && !error" class="transition-colors duration-300" [ngClass]="isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'">
            <li *ngFor="let task of tasks" class="px-4 py-4 transition-colors duration-300" [ngClass]="isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate transition-colors duration-300" [ngClass]="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ task.title }}
                  </p>
                  <div class="mt-1 flex items-center text-sm transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                          [ngClass]="getStatusClass(task.status)">
                      {{ getStatusText(task.status) }}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                          [ngClass]="getPriorityClass(task.priority)">
                      {{ getPriorityText(task.priority) }}
                    </span>
                    <span *ngIf="task.assignedTo">
                      Assigned to {{ task.assignedTo.userName }}
                    </span>
                    <span *ngIf="task.createdBy">
                      Created by {{ task.createdBy.userName }}
                    </span>
                  </div>
                </div>
                <div class="flex-shrink-0 flex items-center space-x-2">
                  <button
                    (click)="openEditTaskModal(task)"
                    class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    title="Edit Task"
                  >
                    Edit
                  </button>
                  <span class="text-sm transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    {{ formatDate(task.createdAt) }}
                  </span>
                </div>
              </div>
            </li>
          </ul>

          <div *ngIf="!loading && !error && tasks.length === 0" class="p-4 text-center transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
            No tasks found. Create your first task to get started!
          </div>
        </div>
      </main>
    </div>

    <!-- Create Task Modal -->
    <div *ngIf="showCreateTaskModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-white' : 'text-gray-900'">Create New Task</h3>
            <button
              (click)="closeCreateTaskModal()"
              class="transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="createTask()" class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title</label>
              <input
                type="text"
                id="title"
                [(ngModel)]="newTask.title"
                name="title"
                required
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                placeholder="Enter task title"
              >
            </div>

            <div>
              <label for="description" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
              <textarea
                id="description"
                [(ngModel)]="newTask.description"
                name="description"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                placeholder="Enter task description"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="priority" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Priority</label>
                <select
                  id="priority"
                  [(ngModel)]="newTask.priority"
                  name="priority"
                  class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                  [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                >
                  <option value="0">Low</option>
                  <option value="1">Medium</option>
                  <option value="2">High</option>
                  <option value="3">Critical</option>
                </select>
              </div>

              <div>
                <label for="status" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Status</label>
                <select
                  id="status"
                  [(ngModel)]="newTask.status"
                  name="status"
                  class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                  [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                >
                  <option value="0">Backlog</option>
                  <option value="1">In Progress</option>
                  <option value="2">Review</option>
                  <option value="3">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label for="assignedTo" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Assign To</label>
              <select
                id="assignedTo"
                [(ngModel)]="newTask.assignedToId"
                name="assignedTo"
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              >
                <option [value]="undefined">Unassigned</option>
                <option *ngFor="let user of availableUsers" [value]="user.id">
                  {{ user.userName }} - {{ user.role.name }}
                </option>
              </select>
              <div *ngIf="loadingUsers" class="mt-1 text-sm transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Loading users...</div>
            </div>

            <div *ngIf="createTaskError" class="text-red-600 text-sm">
              {{ createTaskError }}
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="closeCreateTaskModal()"
                class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300"
                [ngClass]="isDarkMode ? 'text-gray-300 bg-gray-600 hover:bg-gray-500' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="creatingTask || !newTask.title"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md"
              >
                {{ creatingTask ? 'Creating...' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div *ngIf="showEditTaskModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md transition-colors duration-300" [ngClass]="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-white' : 'text-gray-900'">Edit Task</h3>
            <button
              (click)="closeEditTaskModal()"
              class="transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="updateTask()" class="space-y-4">
            <div>
              <label for="editTitle" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title</label>
              <input
                type="text"
                id="editTitle"
                [(ngModel)]="editTask.title"
                name="editTitle"
                required
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                placeholder="Enter task title"
              >
            </div>

            <div>
              <label for="editDescription" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
              <textarea
                id="editDescription"
                [(ngModel)]="editTask.description"
                name="editDescription"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                placeholder="Enter task description"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="editPriority" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Priority</label>
                <select
                  id="editPriority"
                  [(ngModel)]="editTask.priority"
                  name="editPriority"
                  class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                  [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                >
                  <option value="0">Low</option>
                  <option value="1">Medium</option>
                  <option value="2">High</option>
                  <option value="3">Critical</option>
                </select>
              </div>

              <div>
                <label for="editStatus" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Status</label>
                <select
                  id="editStatus"
                  [(ngModel)]="editTask.status"
                  name="editStatus"
                  class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                  [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                >
                  <option value="0">Backlog</option>
                  <option value="1">In Progress</option>
                  <option value="2">Review</option>
                  <option value="3">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label for="editAssignedTo" class="block text-sm font-medium transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Assign To</label>
              <select
                id="editAssignedTo"
                [(ngModel)]="editTask.assignedToId"
                name="editAssignedTo"
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                [ngClass]="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              >
                <option [value]="undefined">Unassigned</option>
                <option *ngFor="let user of availableUsers" [value]="user.id">
                  {{ user.userName }} - {{ user.role.name }}
                </option>
              </select>
              <div *ngIf="loadingUsers" class="mt-1 text-sm transition-colors duration-300" [ngClass]="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Loading users...</div>
            </div>

            <div *ngIf="editTaskError" class="text-red-600 text-sm">
              {{ editTaskError }}
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="closeEditTaskModal()"
                class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300"
                [ngClass]="isDarkMode ? 'text-gray-300 bg-gray-600 hover:bg-gray-500' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="updatingTask || !editTask.title"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md"
              >
                {{ updatingTask ? 'Updating...' : 'Update Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SimpleDashboardComponent implements OnInit {
  currentUser: any = null;
  tasks: Task[] = [];
  loading = false;
  error = '';

  // Create task modal
  showCreateTaskModal = false;
  creatingTask = false;
  createTaskError = '';
  availableUsers: any[] = [];
  loadingUsers = false;
  isDarkMode = false;
  newTask = {
    title: '',
    description: '',
    status: 0, // Backlog
    priority: 1, // Medium
    assignedToId: undefined as number | undefined
  };

  // Edit task modal
  showEditTaskModal = false;
  updatingTask = false;
  editTaskError = '';
  editTask: any = {
    id: 0,
    title: '',
    description: '',
    status: 0,
    priority: 1,
    assignedToId: undefined as number | undefined
  };

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  getTasksByStatus(status: number): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  getStatusText(status: TaskStatus): string {
    const statusMap = {
      [TaskStatus.Backlog]: 'Backlog',
      [TaskStatus.InProgress]: 'In Progress',
      [TaskStatus.Review]: 'Review',
      [TaskStatus.Done]: 'Done'
    };
    return statusMap[status] || 'Unknown';
  }

  getStatusClass(status: TaskStatus): string {
    const classMap = {
      [TaskStatus.Backlog]: 'bg-gray-100 text-gray-800',
      [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800',
      [TaskStatus.Review]: 'bg-yellow-100 text-yellow-800',
      [TaskStatus.Done]: 'bg-green-100 text-green-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityText(priority: TaskPriority): string {
    const priorityMap = {
      [TaskPriority.Low]: 'Low',
      [TaskPriority.Medium]: 'Medium',
      [TaskPriority.High]: 'High',
      [TaskPriority.Critical]: 'Critical'
    };
    return priorityMap[priority] || 'Unknown';
  }

  getPriorityClass(priority: TaskPriority): string {
    const classMap = {
      [TaskPriority.Low]: 'bg-green-100 text-green-800',
      [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-800',
      [TaskPriority.High]: 'bg-orange-100 text-orange-800',
      [TaskPriority.Critical]: 'bg-red-100 text-red-800'
    };
    return classMap[priority] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  canCreateTasks(): boolean {
    return this.currentUser &&
           (this.currentUser.role.name === 'Owner' ||
            this.currentUser.role.name === 'Admin' ||
            this.currentUser.role.name === 'Manager' ||
            this.currentUser.permissions?.some((p: any) => p.name === 'tasks.create'));
  }

  openCreateTaskModal(): void {
    this.showCreateTaskModal = true;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.taskService.getUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
      }
    });
  }

  closeCreateTaskModal(): void {
    this.showCreateTaskModal = false;
    this.createTaskError = '';
    this.newTask = {
      title: '',
      description: '',
      status: 0,
      priority: 1,
      assignedToId: undefined
    };
  }

  createTask(): void {
    if (!this.newTask.title.trim()) {
      this.createTaskError = 'Title is required';
      return;
    }

    this.creatingTask = true;
    this.createTaskError = '';

    const taskData = {
      title: this.newTask.title.trim(),
      description: this.newTask.description.trim(),
      status: Number(this.newTask.status),
      priority: Number(this.newTask.priority),
      assignedToId: this.newTask.assignedToId
    };

    this.taskService.createTask(taskData).subscribe({
      next: (response) => {
        console.log('Task created:', response);
        this.creatingTask = false;
        this.closeCreateTaskModal();
        // Reload tasks to show the new one
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.creatingTask = false;
        this.createTaskError = error.error?.message || 'Failed to create task. Please try again.';
      }
    });
  }

  openEditTaskModal(task: Task): void {
    this.editTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedToId: task.assignedTo?.id || undefined
    };
    this.showEditTaskModal = true;
    this.loadUsers();
  }

  closeEditTaskModal(): void {
    this.showEditTaskModal = false;
    this.editTaskError = '';
    this.editTask = {
      id: 0,
      title: '',
      description: '',
      status: 0,
      priority: 1,
      assignedToId: undefined
    };
  }

  updateTask(): void {
    if (!this.editTask.title.trim()) {
      this.editTaskError = 'Title is required';
      return;
    }

    this.updatingTask = true;
    this.editTaskError = '';

    const taskData = {
      title: this.editTask.title.trim(),
      description: this.editTask.description.trim(),
      status: Number(this.editTask.status),
      priority: Number(this.editTask.priority),
      assignedToId: this.editTask.assignedToId
    };

    this.taskService.updateTask(this.editTask.id, taskData).subscribe({
      next: (response) => {
        console.log('Task updated:', response);
        this.updatingTask = false;
        this.closeEditTaskModal();
        // Reload tasks to show the updated one
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.updatingTask = false;
        this.editTaskError = error.error?.message || 'Failed to update task. Please try again.';
      }
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }
}