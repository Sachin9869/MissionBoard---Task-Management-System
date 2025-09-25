import { createAction, props } from '@ngrx/store';
import { TaskItem } from './task-item.model';

export const loadTaskItems = createAction('[TaskItem] Load TaskItems');
export const loadTaskItemsSuccess = createAction('[TaskItem] Load TaskItems Success', props<{ taskItems: TaskItem[] }>());
export const loadTaskItemsFailure = createAction('[TaskItem] Load TaskItems Failure', props<{ error: any }>());

export const addTaskItem = createAction('[TaskItem] Add TaskItem', props<{ taskItem: TaskItem }>());
export const addTaskItemSuccess = createAction('[TaskItem] Add TaskItem Success', props<{ taskItem: TaskItem }>());
export const addTaskItemFailure = createAction('[TaskItem] Add TaskItem Failure', props<{ error: any }>());

export const updateTaskItem = createAction('[TaskItem] Update TaskItem', props<{ taskItem: TaskItem }>());
export const updateTaskItemSuccess = createAction('[TaskItem] Update TaskItem Success', props<{ taskItem: TaskItem }>());
export const updateTaskItemFailure = createAction('[TaskItem] Update TaskItem Failure', props<{ error: any }>());

export const deleteTaskItem = createAction('[TaskItem] Delete TaskItem', props<{ id: number }>());
export const deleteTaskItemSuccess = createAction('[TaskItem] Delete TaskItem Success', props<{ id: number }>());
export const deleteTaskItemFailure = createAction('[TaskItem] Delete TaskItem Failure', props<{ error: any }>());
