import { createReducer, on } from '@ngrx/store';
import * as TaskItemActions from './task-item.actions';
import { TaskItem } from './task-item.model';

export interface TaskItemState {
  taskItems: TaskItem[];
  error: any;
}

export const initialState: TaskItemState = {
  taskItems: [],
  error: null
};

export const taskItemReducer = createReducer(
  initialState,
  on(TaskItemActions.loadTaskItemsSuccess, (state, { taskItems }) => ({ ...state, taskItems })),
  on(TaskItemActions.loadTaskItemsFailure, (state, { error }) => ({ ...state, error })),
  on(TaskItemActions.addTaskItemSuccess, (state, { taskItem }) => ({ ...state, taskItems: [...state.taskItems, taskItem] })),
  on(TaskItemActions.addTaskItemFailure, (state, { error }) => ({ ...state, error })),
  on(TaskItemActions.updateTaskItemSuccess, (state, { taskItem }) => ({
    ...state,
    taskItems: state.taskItems.map(t => t.id === taskItem.id ? taskItem : t)
  })),
  on(TaskItemActions.updateTaskItemFailure, (state, { error }) => ({ ...state, error })),
  on(TaskItemActions.deleteTaskItemSuccess, (state, { id }) => ({
    ...state,
    taskItems: state.taskItems.filter(t => t.id !== id)
  })),
  on(TaskItemActions.deleteTaskItemFailure, (state, { error }) => ({ ...state, error }))
);
