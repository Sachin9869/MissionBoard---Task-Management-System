import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RightsService } from './rights.service';
import * as RightsActions from './rights.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class RightsEffects {
  loadRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RightsActions.loadRights),
      mergeMap(() =>
        this.rightsService.getAll().pipe(
          map(rights => RightsActions.loadRightsSuccess({ rights })),
          catchError(error => of(RightsActions.loadRightsFailure({ error })))
        )
      )
    )
  );

  addRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RightsActions.addRights),
      mergeMap(action =>
        this.rightsService.add(action.rights).pipe(
          map(rights => RightsActions.addRightsSuccess({ rights })),
          catchError(error => of(RightsActions.addRightsFailure({ error })))
        )
      )
    )
  );

  updateRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RightsActions.updateRights),
      mergeMap(action =>
        this.rightsService.update(action.rights).pipe(
          map(() => RightsActions.updateRightsSuccess({ rights: action.rights })),
          catchError(error => of(RightsActions.updateRightsFailure({ error })))
        )
      )
    )
  );

  deleteRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RightsActions.deleteRights),
      mergeMap(action =>
        this.rightsService.delete(action.id).pipe(
          map(() => RightsActions.deleteRightsSuccess({ id: action.id })),
          catchError(error => of(RightsActions.deleteRightsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private rightsService: RightsService) {}
}
