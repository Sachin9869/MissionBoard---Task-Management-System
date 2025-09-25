import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TeamService } from './team.service';
import * as TeamActions from './team.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class TeamEffects {
  loadTeams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.loadTeams),
      mergeMap(() =>
        this.teamService.getAll().pipe(
          map(teams => TeamActions.loadTeamsSuccess({ teams })),
          catchError(error => of(TeamActions.loadTeamsFailure({ error })))
        )
      )
    )
  );

  addTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.addTeam),
      mergeMap(action =>
        this.teamService.add(action.team).pipe(
          map(team => TeamActions.addTeamSuccess({ team })),
          catchError(error => of(TeamActions.addTeamFailure({ error })))
        )
      )
    )
  );

  updateTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.updateTeam),
      mergeMap(action =>
        this.teamService.update(action.team).pipe(
          map(() => TeamActions.updateTeamSuccess({ team: action.team })),
          catchError(error => of(TeamActions.updateTeamFailure({ error })))
        )
      )
    )
  );

  deleteTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.deleteTeam),
      mergeMap(action =>
        this.teamService.delete(action.id).pipe(
          map(() => TeamActions.deleteTeamSuccess({ id: action.id })),
          catchError(error => of(TeamActions.deleteTeamFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private teamService: TeamService) {}
}
