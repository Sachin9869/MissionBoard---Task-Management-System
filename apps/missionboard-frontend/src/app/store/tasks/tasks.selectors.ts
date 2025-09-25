import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskStatus } from '../../../../../../../libs/shared/ts/models';
import { TasksState } from './tasks.reducer';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectAllTasks = createSelector(
  selectTasksState,
  (state) => state.tasks
);

export const selectTasksLoading = createSelector(
  selectTasksState,
  (state) => state.isLoading
);

export const selectTasksError = createSelector(
  selectTasksState,
  (state) => state.error
);

export const selectSelectedTaskId = createSelector(
  selectTasksState,
  (state) => state.selectedTaskId
);

export const selectSelectedTask = createSelector(
  selectAllTasks,
  selectSelectedTaskId,
  (tasks, selectedId) => tasks.find(task => task.id === selectedId) || null
);

export const selectTasksFilter = createSelector(
  selectTasksState,
  (state) => state.filter
);

export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectTasksFilter,
  (tasks, filter) => {
    return tasks.filter(task => {
      if (filter.teamId && task.teamId !== filter.teamId) return false;
      if (filter.assigneeId && task.assigneeId !== filter.assigneeId) return false;
      if (filter.status !== undefined && task.status !== filter.status) return false;
      if (filter.priority !== undefined && task.priority !== filter.priority) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               task.description?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }
);

export const selectTasksByStatus = createSelector(
  selectFilteredTasks,
  (tasks) => {
    return {
      [TaskStatus.Backlog]: tasks.filter(t => t.status === TaskStatus.Backlog),
      [TaskStatus.InProgress]: tasks.filter(t => t.status === TaskStatus.InProgress),
      [TaskStatus.WithQA]: tasks.filter(t => t.status === TaskStatus.WithQA),
      [TaskStatus.UAT]: tasks.filter(t => t.status === TaskStatus.UAT),
      [TaskStatus.ReadyForProd]: tasks.filter(t => t.status === TaskStatus.ReadyForProd),
      [TaskStatus.Done]: tasks.filter(t => t.status === TaskStatus.Done),
    };
  }
);

export const selectMyTasks = createSelector(
  selectAllTasks,
  (tasks, props: { userId: string }) =>
    tasks.filter(task => task.assigneeId === props.userId || task.createdById === props.userId)
);

export const selectTaskById = createSelector(
  selectAllTasks,
  (tasks, props: { taskId: string }) =>
    tasks.find(task => task.id === props.taskId)
);