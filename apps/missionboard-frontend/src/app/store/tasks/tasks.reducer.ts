import { createReducer, on } from '@ngrx/store';
import { TaskItem } from '../../../../../../../libs/shared/ts/models';
import * as TasksActions from './tasks.actions';

export interface TasksState {
  tasks: TaskItem[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  filter: TasksActions.TaskFilter;
}

export const initialState: TasksState = {
  tasks: [],
  selectedTaskId: null,
  isLoading: false,
  error: null,
  filter: {},
};

export const tasksReducer = createReducer(
  initialState,

  // Load Tasks
  on(TasksActions.loadTasks, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    isLoading: false,
    error: null,
  })),

  on(TasksActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load Single Task
  on(TasksActions.loadTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.loadTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: updateTaskInArray(state.tasks, task),
    isLoading: false,
    error: null,
  })),

  on(TasksActions.loadTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create Task
  on(TasksActions.createTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [task, ...state.tasks],
    isLoading: false,
    error: null,
  })),

  on(TasksActions.createTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Update Task
  on(TasksActions.updateTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: updateTaskInArray(state.tasks, task),
    isLoading: false,
    error: null,
  })),

  on(TasksActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Update Task Status
  on(TasksActions.updateTaskStatus, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.updateTaskStatusSuccess, (state, { task }) => ({
    ...state,
    tasks: updateTaskInArray(state.tasks, task),
    isLoading: false,
    error: null,
  })),

  on(TasksActions.updateTaskStatusFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Assign Task
  on(TasksActions.assignTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.assignTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: updateTaskInArray(state.tasks, task),
    isLoading: false,
    error: null,
  })),

  on(TasksActions.assignTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Delete Task
  on(TasksActions.deleteTask, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.deleteTaskSuccess, (state, { taskId }) => ({
    ...state,
    tasks: state.tasks.filter(task => task.id !== taskId),
    selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
    isLoading: false,
    error: null,
  })),

  on(TasksActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Add Comment
  on(TasksActions.addComment, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.addCommentSuccess, (state, { taskId, comment }) => ({
    ...state,
    tasks: state.tasks.map(task =>
      task.id === taskId
        ? { ...task, comments: [...task.comments, comment] }
        : task
    ),
    isLoading: false,
    error: null,
  })),

  on(TasksActions.addCommentFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // UI State
  on(TasksActions.selectTask, (state, { taskId }) => ({
    ...state,
    selectedTaskId: taskId,
  })),

  on(TasksActions.setFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter },
  })),

  on(TasksActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);

function updateTaskInArray(tasks: TaskItem[], updatedTask: TaskItem): TaskItem[] {
  return tasks.map(task =>
    task.id === updatedTask.id ? updatedTask : task
  );
}