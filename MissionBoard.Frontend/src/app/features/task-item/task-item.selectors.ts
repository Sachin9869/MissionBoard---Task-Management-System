import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskItemState } from './task-item.reducer';

export const selectTaskItemState = createFeatureSelector<TaskItemState>('taskItem');

export const selectAllTaskItems = createSelector(
  selectTaskItemState,
  (state: TaskItemState) => state.taskItems
);

export const selectTaskItemError = createSelector(
  selectTaskItemState,
  (state: TaskItemState) => state.error
);
