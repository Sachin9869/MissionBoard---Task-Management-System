import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TaskItemService } from './task-item.service';
import * as TaskItemActions from './task-item.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class TaskItemEffects {
  loadTaskItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskItemActions.loadTaskItems),
      mergeMap(() =>
        this.taskItemService.getAll().pipe(
          map(taskItems => TaskItemActions.loadTaskItemsSuccess({ taskItems })),
          catchError(error => of(TaskItemActions.loadTaskItemsFailure({ error })))
        )
      )
    )
  );

  addTaskItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskItemActions.addTaskItem),
      mergeMap(action =>
        this.taskItemService.add(action.taskItem).pipe(
          map(taskItem => TaskItemActions.addTaskItemSuccess({ taskItem })),
          catchError(error => of(TaskItemActions.addTaskItemFailure({ error })))
        )
      )
    )
  );

  updateTaskItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskItemActions.updateTaskItem),
      mergeMap(action =>
        this.taskItemService.update(action.taskItem).pipe(
          map(() => TaskItemActions.updateTaskItemSuccess({ taskItem: action.taskItem })),
          catchError(error => of(TaskItemActions.updateTaskItemFailure({ error })))
        )
      )
    )
  );

  deleteTaskItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskItemActions.deleteTaskItem),
      mergeMap(action =>
        this.taskItemService.delete(action.id).pipe(
          map(() => TaskItemActions.deleteTaskItemSuccess({ id: action.id })),
          catchError(error => of(TaskItemActions.deleteTaskItemFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private taskItemService: TaskItemService) {}
}
