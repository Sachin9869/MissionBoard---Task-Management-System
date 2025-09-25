import { createAction, props } from '@ngrx/store';
import { Team } from './team.model';

export const loadTeams = createAction('[Team] Load Teams');
export const loadTeamsSuccess = createAction('[Team] Load Teams Success', props<{ teams: Team[] }>());
export const loadTeamsFailure = createAction('[Team] Load Teams Failure', props<{ error: any }>());

export const addTeam = createAction('[Team] Add Team', props<{ team: Team }>());
export const addTeamSuccess = createAction('[Team] Add Team Success', props<{ team: Team }>());
export const addTeamFailure = createAction('[Team] Add Team Failure', props<{ error: any }>());

export const updateTeam = createAction('[Team] Update Team', props<{ team: Team }>());
export const updateTeamSuccess = createAction('[Team] Update Team Success', props<{ team: Team }>());
export const updateTeamFailure = createAction('[Team] Update Team Failure', props<{ error: any }>());

export const deleteTeam = createAction('[Team] Delete Team', props<{ id: number }>());
export const deleteTeamSuccess = createAction('[Team] Delete Team Success', props<{ id: number }>());
export const deleteTeamFailure = createAction('[Team] Delete Team Failure', props<{ error: any }>());
