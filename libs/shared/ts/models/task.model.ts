export enum TaskStatus {
  Backlog = 0,
  InProgress = 1,
  WithQA = 2,
  UAT = 3,
  ReadyForProd = 4,
  Done = 5
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdById: string;
  createdByName: string;
  assigneeId?: string;
  assigneeName?: string;
  teamId?: string;
  teamName?: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  estimatedHours?: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  teamId?: string;
  dueDate?: string;
  estimatedHours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  teamId?: string;
  dueDate?: string;
  estimatedHours?: number;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface CreateCommentRequest {
  text: string;
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: 'Backlog',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.WithQA]: 'With QA',
  [TaskStatus.UAT]: 'UAT',
  [TaskStatus.ReadyForProd]: 'Ready for Prod',
  [TaskStatus.Done]: 'Done'
};

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'Low',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.High]: 'High',
  [TaskPriority.Critical]: 'Critical'
};

export const TaskPriorityColors: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'text-gray-600',
  [TaskPriority.Medium]: 'text-blue-600',
  [TaskPriority.High]: 'text-orange-600',
  [TaskPriority.Critical]: 'text-red-600'
};