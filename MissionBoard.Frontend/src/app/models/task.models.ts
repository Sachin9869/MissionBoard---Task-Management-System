export enum TaskStatus {
  Backlog = 0,
  InProgress = 1,
  Review = 2,
  Done = 3
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  createdBy: {
    id: number;
    userName: string;
  };
  assignedTo?: {
    id: number;
    userName: string;
  };
  team?: {
    id: number;
    name: string;
  };
  commentsCount: number;
}

export interface TaskComment {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    userName: string;
  };
}

export interface TaskDetails extends Task {
  comments: TaskComment[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assignedToId?: number;
  teamId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}

export interface TaskFilter {
  status?: TaskStatus;
  teamId?: number;
  assignedToMe?: boolean;
}