import { createAction, props } from '@ngrx/store';
import {
  TaskItem,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  CreateCommentRequest,
  Comment
} from '../../../../../../../libs/shared/ts/models';

// Load Tasks
export const loadTasks = createAction(
  '[Tasks] Load Tasks',
  props<{ teamId?: string }>()
);

export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: TaskItem[] }>()
);

export const loadTasksFailure = createAction(
  '[Tasks] Load Tasks Failure',
  props<{ error: string }>()
);

// Load Single Task
export const loadTask = createAction(
  '[Tasks] Load Task',
  props<{ taskId: string }>()
);

export const loadTaskSuccess = createAction(
  '[Tasks] Load Task Success',
  props<{ task: TaskItem }>()
);

export const loadTaskFailure = createAction(
  '[Tasks] Load Task Failure',
  props<{ error: string }>()
);

// Create Task
export const createTask = createAction(
  '[Tasks] Create Task',
  props<{ task: CreateTaskRequest }>()
);

export const createTaskSuccess = createAction(
  '[Tasks] Create Task Success',
  props<{ task: TaskItem }>()
);

export const createTaskFailure = createAction(
  '[Tasks] Create Task Failure',
  props<{ error: string }>()
);

// Update Task
export const updateTask = createAction(
  '[Tasks] Update Task',
  props<{ taskId: string; updates: UpdateTaskRequest }>()
);

export const updateTaskSuccess = createAction(
  '[Tasks] Update Task Success',
  props<{ task: TaskItem }>()
);

export const updateTaskFailure = createAction(
  '[Tasks] Update Task Failure',
  props<{ error: string }>()
);

// Update Task Status
export const updateTaskStatus = createAction(
  '[Tasks] Update Task Status',
  props<{ taskId: string; statusUpdate: UpdateTaskStatusRequest }>()
);

export const updateTaskStatusSuccess = createAction(
  '[Tasks] Update Task Status Success',
  props<{ task: TaskItem }>()
);

export const updateTaskStatusFailure = createAction(
  '[Tasks] Update Task Status Failure',
  props<{ error: string }>()
);

// Assign Task
export const assignTask = createAction(
  '[Tasks] Assign Task',
  props<{ taskId: string; assignment: AssignTaskRequest }>()
);

export const assignTaskSuccess = createAction(
  '[Tasks] Assign Task Success',
  props<{ task: TaskItem }>()
);

export const assignTaskFailure = createAction(
  '[Tasks] Assign Task Failure',
  props<{ error: string }>()
);

// Delete Task
export const deleteTask = createAction(
  '[Tasks] Delete Task',
  props<{ taskId: string }>()
);

export const deleteTaskSuccess = createAction(
  '[Tasks] Delete Task Success',
  props<{ taskId: string }>()
);

export const deleteTaskFailure = createAction(
  '[Tasks] Delete Task Failure',
  props<{ error: string }>()
);

// Add Comment
export const addComment = createAction(
  '[Tasks] Add Comment',
  props<{ taskId: string; comment: CreateCommentRequest }>()
);

export const addCommentSuccess = createAction(
  '[Tasks] Add Comment Success',
  props<{ taskId: string; comment: Comment }>()
);

export const addCommentFailure = createAction(
  '[Tasks] Add Comment Failure',
  props<{ error: string }>()
);

// UI State
export const selectTask = createAction(
  '[Tasks] Select Task',
  props<{ taskId: string | null }>()
);

export const setFilter = createAction(
  '[Tasks] Set Filter',
  props<{ filter: TaskFilter }>()
);

export const clearError = createAction('[Tasks] Clear Error');

export interface TaskFilter {
  teamId?: string;
  assigneeId?: string;
  status?: number;
  priority?: number;
  search?: string;
}